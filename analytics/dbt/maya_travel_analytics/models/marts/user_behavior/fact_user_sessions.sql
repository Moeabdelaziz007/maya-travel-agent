{{ config(materialized='table') }}

-- Fact table for user sessions and engagement patterns
-- Provides comprehensive user behavior analytics

WITH user_session_aggregation AS (
    SELECT
        user_id,
        session_id,

        -- Session timing
        session_start,
        session_end,
        session_duration_minutes,

        -- Session characteristics
        message_count,
        interaction_types,
        user_messages,
        assistant_messages,

        -- Performance metrics
        avg_response_time_ms,
        avg_satisfaction_score,
        engagement_score,
        engagement_category,

        -- Session categories
        session_length_category,
        satisfaction_level,

        -- Additional metrics
        CASE
            WHEN session_duration_minutes > 0 THEN
                (message_count::FLOAT / session_duration_minutes)
            ELSE 0
        END as messages_per_minute,

        CASE
            WHEN user_messages > 0 THEN
                (assistant_messages::FLOAT / user_messages)
            ELSE 0
        END as assistant_to_user_ratio

    FROM {{ ref('int_user_sessions') }}
    WHERE has_activity = true
),

user_behavior_summary AS (
    SELECT
        usa.user_id,
        usa.session_id,
        usa.session_start,
        usa.session_end,
        usa.session_duration_minutes,
        usa.message_count,
        usa.interaction_types,
        usa.user_messages,
        usa.assistant_messages,
        usa.avg_response_time_ms,
        usa.avg_satisfaction_score,
        usa.engagement_score,
        usa.engagement_category,
        usa.session_length_category,
        usa.satisfaction_level,
        usa.messages_per_minute,
        usa.assistant_to_user_ratio,

        -- Join with user data for additional context
        u.engagement_level as user_engagement_level,
        u.travel_style,
        u.budget_range,
        u.total_trips,
        u.last_active,

        -- Calculate session quality score
        CASE
            WHEN usa.engagement_score >= 70 AND usa.avg_satisfaction_score >= 4 THEN 'excellent'
            WHEN usa.engagement_score >= 50 AND usa.avg_satisfaction_score >= 3 THEN 'good'
            WHEN usa.engagement_score >= 30 OR usa.avg_satisfaction_score >= 3 THEN 'fair'
            ELSE 'poor'
        END as session_quality

    FROM user_session_aggregation usa
    LEFT JOIN {{ ref('stg_users') }} u ON usa.user_id = u.user_id
)

SELECT
    user_id,
    session_id,
    session_start,
    session_end,
    session_duration_minutes,
    message_count,
    interaction_types,
    user_messages,
    assistant_messages,
    avg_response_time_ms,
    avg_satisfaction_score,
    engagement_score,
    engagement_category,
    session_length_category,
    satisfaction_level,
    messages_per_minute,
    assistant_to_user_ratio,
    user_engagement_level,
    travel_style,
    budget_range,
    total_trips,
    last_active,
    session_quality,

    -- Data quality indicators
    CASE WHEN session_duration_minutes > 0 THEN true ELSE false END as valid_duration,
    CASE WHEN message_count > 0 THEN true ELSE false END as has_interaction,
    CASE WHEN avg_satisfaction_score IS NOT NULL THEN true ELSE false END as has_satisfaction_data

FROM user_behavior_summary