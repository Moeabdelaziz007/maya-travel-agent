{{ config(materialized='table') }}

-- Dimension table for user engagement patterns
-- Provides user-level engagement analytics and segmentation

WITH user_engagement_metrics AS (
    SELECT
        user_id,

        -- Session aggregations
        COUNT(DISTINCT session_id) as total_sessions,
        SUM(message_count) as total_messages,
        SUM(session_duration_minutes) as total_session_time_minutes,
        AVG(engagement_score) as avg_engagement_score,
        AVG(avg_satisfaction_score) as avg_satisfaction_score,

        -- Session patterns
        COUNT(DISTINCT session_length_category) as session_length_variety,
        COUNT(DISTINCT engagement_category) as engagement_category_variety,

        -- Time-based metrics
        MIN(session_start) as first_session_date,
        MAX(session_end) as last_session_date,
        DATEDIFF(day, MIN(session_start), MAX(session_end)) as active_days_span,

        -- Engagement trends
        COUNT(CASE WHEN engagement_category = 'highly_engaged' THEN 1 END) as highly_engaged_sessions,
        COUNT(CASE WHEN engagement_category = 'disengaged' THEN 1 END) as disengaged_sessions,

        -- Quality metrics
        COUNT(CASE WHEN session_quality = 'excellent' THEN 1 END) as excellent_sessions,
        COUNT(CASE WHEN session_quality = 'poor' THEN 1 END) as poor_sessions

    FROM {{ ref('fact_user_sessions') }}
    WHERE valid_duration = true
    GROUP BY user_id
),

user_engagement_analysis AS (
    SELECT
        uem.user_id,
        uem.total_sessions,
        uem.total_messages,
        uem.total_session_time_minutes,
        uem.avg_engagement_score,
        uem.avg_satisfaction_score,
        uem.session_length_variety,
        uem.engagement_category_variety,
        uem.first_session_date,
        uem.last_session_date,
        uem.active_days_span,
        uem.highly_engaged_sessions,
        uem.disengaged_sessions,
        uem.excellent_sessions,
        uem.poor_sessions,

        -- Derived engagement metrics
        CASE
            WHEN uem.total_sessions > 0 THEN
                uem.total_session_time_minutes::FLOAT / uem.total_sessions
            ELSE 0
        END as avg_session_duration_minutes,

        CASE
            WHEN uem.total_sessions > 0 THEN
                uem.total_messages::FLOAT / uem.total_sessions
            ELSE 0
        END as avg_messages_per_session,

        CASE
            WHEN uem.total_sessions > 0 THEN
                (uem.highly_engaged_sessions::FLOAT / uem.total_sessions) * 100
            ELSE 0
        END as highly_engaged_percentage,

        CASE
            WHEN uem.total_sessions > 0 THEN
                (uem.disengaged_sessions::FLOAT / uem.total_sessions) * 100
            ELSE 0
        END as disengaged_percentage,

        -- User engagement classification
        CASE
            WHEN uem.avg_engagement_score >= 70 THEN 'highly_engaged'
            WHEN uem.avg_engagement_score >= 50 THEN 'moderately_engaged'
            WHEN uem.avg_engagement_score >= 30 THEN 'lightly_engaged'
            ELSE 'disengaged'
        END as user_engagement_level,

        -- Engagement consistency
        CASE
            WHEN uem.engagement_category_variety <= 1 THEN 'consistent'
            WHEN uem.engagement_category_variety <= 2 THEN 'moderate_variation'
            ELSE 'highly_variable'
        END as engagement_consistency,

        -- Join with user profile data
        u.engagement_level as profile_engagement_level,
        u.travel_style,
        u.budget_range,
        u.total_trips,
        u.last_active,

        -- Calculate engagement trend
        CASE
            WHEN uem.highly_engaged_sessions > uem.disengaged_sessions THEN 'improving'
            WHEN uem.disengaged_sessions > uem.highly_engaged_sessions THEN 'declining'
            ELSE 'stable'
        END as engagement_trend

    FROM user_engagement_metrics uem
    LEFT JOIN {{ ref('stg_users') }} u ON uem.user_id = u.user_id
)

SELECT
    user_id,
    total_sessions,
    total_messages,
    total_session_time_minutes,
    avg_engagement_score,
    avg_satisfaction_score,
    session_length_variety,
    engagement_category_variety,
    first_session_date,
    last_session_date,
    active_days_span,
    highly_engaged_sessions,
    disengaged_sessions,
    excellent_sessions,
    poor_sessions,
    avg_session_duration_minutes,
    avg_messages_per_session,
    highly_engaged_percentage,
    disengaged_percentage,
    user_engagement_level,
    engagement_consistency,
    profile_engagement_level,
    travel_style,
    budget_range,
    total_trips,
    last_active,
    engagement_trend,

    -- Data quality indicators
    CASE WHEN total_sessions > 0 THEN true ELSE false END as has_session_data,
    CASE WHEN active_days_span >= 0 THEN true ELSE false END as valid_time_span

FROM user_engagement_analysis