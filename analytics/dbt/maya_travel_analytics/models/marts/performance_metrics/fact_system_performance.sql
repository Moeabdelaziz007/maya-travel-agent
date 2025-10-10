{{ config(materialized='table') }}

-- Fact table for system performance metrics
-- Tracks response times, satisfaction, and system health

WITH performance_aggregation AS (
    SELECT
        performance_date,
        user_id,

        -- Response time metrics
        avg_response_time_ms,
        median_response_time_ms,
        p95_response_time_ms,

        -- Performance categories
        response_performance_category,
        satisfaction_category,

        -- Volume and quality metrics
        total_conversations,
        total_content_length,
        avg_satisfaction_score,
        error_rate_percentage,
        system_health_status,

        -- Quality indicators
        has_high_satisfaction,
        has_low_satisfaction,

        -- Calculate performance score (0-100)
        CASE
            WHEN avg_response_time_ms < 1000 THEN 40
            WHEN avg_response_time_ms < 2000 THEN 30
            WHEN avg_response_time_ms < 5000 THEN 20
            WHEN avg_response_time_ms < 10000 THEN 10
            ELSE 0
        END +
        CASE
            WHEN avg_satisfaction_score >= 4.5 THEN 40
            WHEN avg_satisfaction_score >= 4.0 THEN 30
            WHEN avg_satisfaction_score >= 3.0 THEN 20
            ELSE 10
        END +
        CASE
            WHEN error_rate_percentage <= 5 THEN 20
            WHEN error_rate_percentage <= 15 THEN 10
            ELSE 0
        END as performance_score

    FROM {{ ref('int_performance_metrics') }}
    WHERE has_activity = true AND has_performance_data = true
),

performance_analysis AS (
    SELECT
        pa.performance_date,
        pa.user_id,
        pa.avg_response_time_ms,
        pa.median_response_time_ms,
        pa.p95_response_time_ms,
        pa.response_performance_category,
        pa.satisfaction_category,
        pa.total_conversations,
        pa.total_content_length,
        pa.avg_satisfaction_score,
        pa.error_rate_percentage,
        pa.system_health_status,
        pa.has_high_satisfaction,
        pa.has_low_satisfaction,
        pa.performance_score,

        -- Join with user data for context
        u.engagement_level,
        u.travel_style,
        u.budget_range,

        -- Performance trends
        CASE
            WHEN pa.performance_score >= 80 THEN 'excellent'
            WHEN pa.performance_score >= 60 THEN 'good'
            WHEN pa.performance_score >= 40 THEN 'fair'
            WHEN pa.performance_score >= 20 THEN 'poor'
            ELSE 'critical'
        END as overall_performance_category,

        -- Performance efficiency ratio
        CASE
            WHEN pa.avg_response_time_ms > 0 THEN
                (pa.total_conversations::FLOAT / pa.avg_response_time_ms) * 1000
            ELSE 0
        END as conversations_per_ms,

        -- Content efficiency
        CASE
            WHEN pa.total_content_length > 0 THEN
                (pa.total_conversations::FLOAT / pa.total_content_length) * 1000
            ELSE 0
        END as conversations_per_char

    FROM performance_aggregation pa
    LEFT JOIN {{ ref('stg_users') }} u ON pa.user_id = u.user_id
)

SELECT
    performance_date,
    user_id,
    avg_response_time_ms,
    median_response_time_ms,
    p95_response_time_ms,
    response_performance_category,
    satisfaction_category,
    total_conversations,
    total_content_length,
    avg_satisfaction_score,
    error_rate_percentage,
    system_health_status,
    has_high_satisfaction,
    has_low_satisfaction,
    performance_score,
    engagement_level,
    travel_style,
    budget_range,
    overall_performance_category,
    conversations_per_ms,
    conversations_per_char,

    -- Data quality indicators
    CASE WHEN total_conversations > 0 THEN true ELSE false END as has_conversation_data,
    CASE WHEN avg_response_time_ms IS NOT NULL THEN true ELSE false END as has_response_metrics,
    CASE WHEN performance_score >= 0 THEN true ELSE false END as valid_performance_score

FROM performance_analysis