{{ config(materialized='table') }}

-- Fact table for trip conversion funnel analytics
-- Tracks user journey from planning to completion

WITH trip_funnel_analysis AS (
    SELECT
        user_id,
        trip_id,
        trip_created_at,
        funnel_stage,
        conversion_stage,
        stage_value,
        days_in_stage,
        reached_conversion,
        completed_conversion,
        stage_velocity,

        -- Join with user data for context
        u.engagement_level,
        u.travel_style,
        u.budget_range,
        u.total_trips,

        -- Calculate conversion metrics
        CASE
            WHEN completed_conversion = true THEN 1
            ELSE 0
        END as conversion_success,

        CASE
            WHEN reached_conversion = true THEN 1
            ELSE 0
        END as conversion_attempt,

        -- Stage progression indicators
        ROW_NUMBER() OVER (PARTITION BY user_id, trip_id ORDER BY trip_created_at) as stage_order,
        LEAD(funnel_stage) OVER (PARTITION BY user_id, trip_id ORDER BY trip_created_at) as next_stage

    FROM {{ ref('int_trip_funnel_stages') }} tfs
    LEFT JOIN {{ ref('stg_users') }} u ON tfs.user_id = u.user_id
    WHERE valid_timing = true
),

funnel_metrics AS (
    SELECT
        tfa.user_id,
        tfa.trip_id,
        tfa.trip_created_at,
        tfa.funnel_stage,
        tfa.conversion_stage,
        tfa.stage_value,
        tfa.days_in_stage,
        tfa.reached_conversion,
        tfa.completed_conversion,
        tfa.stage_velocity,
        tfa.engagement_level,
        tfa.travel_style,
        tfa.budget_range,
        tfa.total_trips,
        tfa.conversion_success,
        tfa.conversion_attempt,
        tfa.stage_order,
        tfa.next_stage,

        -- Calculate stage efficiency
        CASE
            WHEN tfa.days_in_stage <= 7 THEN 'fast'
            WHEN tfa.days_in_stage <= 30 THEN 'normal'
            WHEN tfa.days_in_stage <= 90 THEN 'slow'
            ELSE 'very_slow'
        END as stage_efficiency,

        -- Stage progression analysis
        CASE
            WHEN tfa.next_stage IS NOT NULL AND tfa.funnel_stage != tfa.next_stage THEN 'progressed'
            WHEN tfa.next_stage IS NULL THEN 'final_stage'
            ELSE 'stayed'
        END as stage_progression,

        -- Value per day in stage
        CASE
            WHEN tfa.days_in_stage > 0 THEN tfa.stage_value / tfa.days_in_stage
            ELSE 0
        END as value_per_day

    FROM trip_funnel_analysis tfa
)

SELECT
    user_id,
    trip_id,
    trip_created_at,
    funnel_stage,
    conversion_stage,
    stage_value,
    days_in_stage,
    reached_conversion,
    completed_conversion,
    stage_velocity,
    engagement_level,
    travel_style,
    budget_range,
    total_trips,
    conversion_success,
    conversion_attempt,
    stage_order,
    next_stage,
    stage_efficiency,
    stage_progression,
    value_per_day,

    -- Data quality indicators
    CASE WHEN stage_value >= 0 THEN true ELSE false END as valid_value,
    CASE WHEN days_in_stage >= 0 THEN true ELSE false END as valid_duration,
    CASE WHEN stage_order IS NOT NULL THEN true ELSE false END as has_progression_data

FROM funnel_metrics