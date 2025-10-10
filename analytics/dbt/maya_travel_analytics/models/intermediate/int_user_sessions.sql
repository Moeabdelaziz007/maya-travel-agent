{{ config(materialized='view') }}

-- Intermediate model for user sessions
-- Aggregates conversation data into sessions for behavior analysis

WITH session_windows AS (
    SELECT
        user_id,
        session_id,
        MIN(created_at) as session_start,
        MAX(created_at) as session_end,
        COUNT(*) as message_count,
        COUNT(DISTINCT message_type) as interaction_types,
        AVG(response_time_ms) as avg_response_time_ms,
        AVG(satisfaction_score) as avg_satisfaction_score,
        SUM(CASE WHEN message_type = 'user' THEN 1 ELSE 0 END) as user_messages,
        SUM(CASE WHEN message_type = 'assistant' THEN 1 ELSE 0 END) as assistant_messages
    FROM {{ ref('stg_conversations') }}
    WHERE has_content = true
    GROUP BY user_id, session_id
),

session_metrics AS (
    SELECT
        user_id,
        session_id,
        session_start,
        session_end,

        -- Session duration in minutes
        DATEDIFF(minute, session_start, session_end) as session_duration_minutes,

        -- Session characteristics
        message_count,
        interaction_types,
        avg_response_time_ms,
        avg_satisfaction_score,
        user_messages,
        assistant_messages,

        -- Derived metrics
        CASE
            WHEN DATEDIFF(minute, session_start, session_end) > 60 THEN 'long'
            WHEN DATEDIFF(minute, session_start, session_end) > 15 THEN 'medium'
            ELSE 'short'
        END as session_length_category,

        CASE
            WHEN avg_satisfaction_score >= 4 THEN 'high'
            WHEN avg_satisfaction_score >= 3 THEN 'medium'
            ELSE 'low'
        END as satisfaction_level,

        -- Engagement score (0-100)
        LEAST(100, (message_count * 10) + (interaction_types * 5) +
              CASE WHEN avg_satisfaction_score >= 4 THEN 20 ELSE 0 END) as engagement_score

    FROM session_windows
    WHERE session_duration_minutes > 0
)

SELECT
    user_id,
    session_id,
    session_start,
    session_end,
    session_duration_minutes,
    message_count,
    interaction_types,
    avg_response_time_ms,
    avg_satisfaction_score,
    user_messages,
    assistant_messages,
    session_length_category,
    satisfaction_level,
    engagement_score,

    -- Additional derived fields
    CASE
        WHEN engagement_score >= 70 THEN 'highly_engaged'
        WHEN engagement_score >= 40 THEN 'moderately_engaged'
        WHEN engagement_score >= 10 THEN 'lightly_engaged'
        ELSE 'disengaged'
    END as engagement_category,

    -- Data quality indicators
    CASE WHEN message_count > 0 THEN true ELSE false END as has_activity,
    CASE WHEN avg_response_time_ms IS NOT NULL THEN true ELSE false END as has_response_metrics

FROM session_metrics