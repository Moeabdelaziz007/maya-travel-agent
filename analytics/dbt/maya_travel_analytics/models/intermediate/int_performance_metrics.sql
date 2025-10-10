{{ config(materialized='view') }}

-- Intermediate model for system performance metrics
-- Aggregates conversation and system performance data

WITH conversation_performance AS (
    SELECT
        DATE_TRUNC('day', created_at) as performance_date,
        user_id,

        -- Response time metrics
        AVG(response_time_ms) as avg_response_time_ms,
        MIN(response_time_ms) as min_response_time_ms,
        MAX(response_time_ms) as max_response_time_ms,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time_ms,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time_ms,

        -- Satisfaction metrics
        AVG(satisfaction_score) as avg_satisfaction_score,
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN satisfaction_score >= 4 THEN 1 END) as high_satisfaction_count,
        COUNT(CASE WHEN satisfaction_score <= 2 THEN 1 END) as low_satisfaction_count,

        -- Message characteristics
        AVG(content_length) as avg_content_length,
        SUM(content_length) as total_content_length

    FROM {{ ref('stg_conversations') }}
    WHERE has_response_time = true
    GROUP BY DATE_TRUNC('day', created_at), user_id
),

daily_performance AS (
    SELECT
        performance_date,
        user_id,

        -- Response time KPIs
        avg_response_time_ms,
        median_response_time_ms,
        p95_response_time_ms,

        -- Performance categories
        CASE
            WHEN avg_response_time_ms < 1000 THEN 'excellent'
            WHEN avg_response_time_ms < 2000 THEN 'good'
            WHEN avg_response_time_ms < 5000 THEN 'acceptable'
            WHEN avg_response_time_ms < 10000 THEN 'slow'
            ELSE 'very_slow'
        END as response_performance_category,

        -- Satisfaction KPIs
        avg_satisfaction_score,
        CASE
            WHEN avg_satisfaction_score >= 4.5 THEN 'excellent'
            WHEN avg_satisfaction_score >= 4.0 THEN 'good'
            WHEN avg_satisfaction_score >= 3.0 THEN 'acceptable'
            WHEN avg_satisfaction_score >= 2.0 THEN 'poor'
            ELSE 'very_poor'
        END as satisfaction_category,

        -- Volume metrics
        total_conversations,
        total_content_length,

        -- Quality indicators
        CASE WHEN high_satisfaction_count > 0 THEN true ELSE false END as has_high_satisfaction,
        CASE WHEN low_satisfaction_count > 0 THEN true ELSE false END as has_low_satisfaction,

        -- Error rate (conversations with very slow response or low satisfaction)
        (low_satisfaction_count::FLOAT / NULLIF(total_conversations, 0)) * 100 as error_rate_percentage

    FROM conversation_performance
    WHERE total_conversations > 0
)

SELECT
    performance_date,
    user_id,
    avg_response_time_ms,
    median_response_time_ms,
    p95_response_time_ms,
    response_performance_category,
    avg_satisfaction_score,
    satisfaction_category,
    total_conversations,
    total_content_length,
    has_high_satisfaction,
    has_low_satisfaction,
    error_rate_percentage,

    -- Additional derived metrics
    CASE
        WHEN error_rate_percentage <= 5 THEN 'healthy'
        WHEN error_rate_percentage <= 15 THEN 'degraded'
        WHEN error_rate_percentage <= 30 THEN 'unhealthy'
        ELSE 'critical'
    END as system_health_status,

    -- Data quality indicators
    CASE WHEN total_conversations > 0 THEN true ELSE false END as has_activity,
    CASE WHEN avg_response_time_ms IS NOT NULL THEN true ELSE false END as has_performance_data

FROM daily_performance