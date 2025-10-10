{{ config(materialized='table') }}

-- Dimension table for conversion funnel analysis
-- Provides aggregated funnel metrics and conversion rates

WITH funnel_stage_aggregation AS (
    SELECT
        funnel_stage,
        conversion_stage,

        -- Volume metrics
        COUNT(*) as total_entries,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT trip_id) as unique_trips,

        -- Conversion metrics
        SUM(conversion_success) as successful_conversions,
        SUM(conversion_attempt) as conversion_attempts,
        SUM(completed_conversion) as completed_conversions,

        -- Value metrics
        SUM(stage_value) as total_stage_value,
        AVG(stage_value) as avg_stage_value,

        -- Time metrics
        AVG(days_in_stage) as avg_days_in_stage,
        MIN(days_in_stage) as min_days_in_stage,
        MAX(days_in_stage) as max_days_in_stage,

        -- Stage characteristics
        COUNT(DISTINCT stage_velocity) as velocity_categories,
        COUNT(DISTINCT stage_efficiency) as efficiency_categories

    FROM {{ ref('fact_trip_conversion') }}
    WHERE valid_value = true AND valid_duration = true
    GROUP BY funnel_stage, conversion_stage
),

funnel_stage_analysis AS (
    SELECT
        fsa.funnel_stage,
        fsa.conversion_stage,
        fsa.total_entries,
        fsa.unique_users,
        fsa.unique_trips,
        fsa.successful_conversions,
        fsa.conversion_attempts,
        fsa.completed_conversions,
        fsa.total_stage_value,
        fsa.avg_stage_value,
        fsa.avg_days_in_stage,
        fsa.min_days_in_stage,
        fsa.max_days_in_stage,
        fsa.velocity_categories,
        fsa.efficiency_categories,

        -- Calculate conversion rates
        CASE
            WHEN fsa.total_entries > 0 THEN
                (fsa.successful_conversions::FLOAT / fsa.total_entries) * 100
            ELSE 0
        END as conversion_rate_percentage,

        CASE
            WHEN fsa.conversion_attempts > 0 THEN
                (fsa.completed_conversions::FLOAT / fsa.conversion_attempts) * 100
            ELSE 0
        END as completion_rate_percentage,

        -- Calculate value per user
        CASE
            WHEN fsa.unique_users > 0 THEN
                fsa.total_stage_value / fsa.unique_users
            ELSE 0
        END as value_per_user,

        -- Stage efficiency score (0-100)
        CASE
            WHEN fsa.avg_days_in_stage > 0 THEN
                LEAST(100, 100 - ((fsa.avg_days_in_stage / 30) * 20))
            ELSE 0
        END as stage_efficiency_score,

        -- Stage performance category
        CASE
            WHEN fsa.conversion_rate_percentage >= 80 THEN 'excellent'
            WHEN fsa.conversion_rate_percentage >= 60 THEN 'good'
            WHEN fsa.conversion_rate_percentage >= 40 THEN 'fair'
            WHEN fsa.conversion_rate_percentage >= 20 THEN 'poor'
            ELSE 'very_poor'
        END as stage_performance_category

    FROM funnel_stage_aggregation fsa
)

SELECT
    funnel_stage,
    conversion_stage,
    total_entries,
    unique_users,
    unique_trips,
    successful_conversions,
    conversion_attempts,
    completed_conversions,
    total_stage_value,
    avg_stage_value,
    avg_days_in_stage,
    min_days_in_stage,
    max_days_in_stage,
    velocity_categories,
    efficiency_categories,
    conversion_rate_percentage,
    completion_rate_percentage,
    value_per_user,
    stage_efficiency_score,
    stage_performance_category,

    -- Data quality indicators
    CASE WHEN total_entries > 0 THEN true ELSE false END as has_data,
    CASE WHEN conversion_rate_percentage >= 0 THEN true ELSE false END as valid_conversion_rate

FROM funnel_stage_analysis