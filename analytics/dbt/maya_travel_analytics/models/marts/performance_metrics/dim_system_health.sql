{{ config(materialized='table') }}

-- Dimension table for system health and performance trends
-- Provides aggregated system health metrics and trends

WITH health_aggregation AS (
    SELECT
        DATE_TRUNC('week', performance_date) as health_week,
        system_health_status,

        -- Volume metrics
        COUNT(*) as total_days,
        SUM(total_conversations) as total_weekly_conversations,
        AVG(total_conversations) as avg_daily_conversations,

        -- Performance metrics
        AVG(avg_response_time_ms) as avg_weekly_response_time_ms,
        AVG(median_response_time_ms) as avg_weekly_median_response_time_ms,
        AVG(p95_response_time_ms) as avg_weekly_p95_response_time_ms,

        -- Quality metrics
        AVG(avg_satisfaction_score) as avg_weekly_satisfaction_score,
        AVG(error_rate_percentage) as avg_weekly_error_rate_percentage,
        AVG(performance_score) as avg_weekly_performance_score,

        -- Health indicators
        COUNT(CASE WHEN system_health_status = 'healthy' THEN 1 END) as healthy_days,
        COUNT(CASE WHEN system_health_status = 'critical' THEN 1 END) as critical_days,
        COUNT(CASE WHEN has_high_satisfaction = true THEN 1 END) as high_satisfaction_days,
        COUNT(CASE WHEN has_low_satisfaction = true THEN 1 END) as low_satisfaction_days

    FROM {{ ref('fact_system_performance') }}
    WHERE has_conversation_data = true
    GROUP BY DATE_TRUNC('week', performance_date), system_health_status
),

health_analysis AS (
    SELECT
        ha.health_week,
        ha.system_health_status,
        ha.total_days,
        ha.total_weekly_conversations,
        ha.avg_daily_conversations,
        ha.avg_weekly_response_time_ms,
        ha.avg_weekly_median_response_time_ms,
        ha.avg_weekly_p95_response_time_ms,
        ha.avg_weekly_satisfaction_score,
        ha.avg_weekly_error_rate_percentage,
        ha.avg_weekly_performance_score,
        ha.healthy_days,
        ha.critical_days,
        ha.high_satisfaction_days,
        ha.low_satisfaction_days,

        -- Calculate health percentages
        CASE
            WHEN ha.total_days > 0 THEN
                (ha.healthy_days::FLOAT / ha.total_days) * 100
            ELSE 0
        END as healthy_percentage,

        CASE
            WHEN ha.total_days > 0 THEN
                (ha.critical_days::FLOAT / ha.total_days) * 100
            ELSE 0
        END as critical_percentage,

        -- Health trend indicators
        CASE
            WHEN ha.avg_weekly_performance_score >= 80 THEN 'excellent'
            WHEN ha.avg_weekly_performance_score >= 60 THEN 'good'
            WHEN ha.avg_weekly_performance_score >= 40 THEN 'fair'
            WHEN ha.avg_weekly_performance_score >= 20 THEN 'poor'
            ELSE 'critical'
        END as overall_health_category,

        -- Performance stability
        CASE
            WHEN ha.avg_weekly_error_rate_percentage <= 5 THEN 'stable'
            WHEN ha.avg_weekly_error_rate_percentage <= 15 THEN 'moderate_volatility'
            ELSE 'high_volatility'
        END as performance_stability,

        -- Quality consistency
        CASE
            WHEN ha.high_satisfaction_days >= ha.low_satisfaction_days THEN 'improving'
            WHEN ha.low_satisfaction_days > ha.high_satisfaction_days THEN 'declining'
            ELSE 'stable'
        END as quality_trend

    FROM health_aggregation ha
)

SELECT
    health_week,
    system_health_status,
    total_days,
    total_weekly_conversations,
    avg_daily_conversations,
    avg_weekly_response_time_ms,
    avg_weekly_median_response_time_ms,
    avg_weekly_p95_response_time_ms,
    avg_weekly_satisfaction_score,
    avg_weekly_error_rate_percentage,
    avg_weekly_performance_score,
    healthy_days,
    critical_days,
    high_satisfaction_days,
    low_satisfaction_days,
    healthy_percentage,
    critical_percentage,
    overall_health_category,
    performance_stability,
    quality_trend,

    -- Data quality indicators
    CASE WHEN total_days > 0 THEN true ELSE false END as has_weekly_data,
    CASE WHEN avg_weekly_performance_score >= 0 THEN true ELSE false END as valid_performance_metrics

FROM health_analysis