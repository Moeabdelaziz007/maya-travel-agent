{{ config(materialized='view') }}

-- Intermediate model for trip funnel stages
-- Maps trip lifecycle to conversion funnel stages

WITH trip_stage_mapping AS (
    SELECT
        trip_id,
        user_id,
        created_at as trip_created_at,
        start_date,
        end_date,
        status,
        budget,
        actual_cost,
        satisfaction_score,

        -- Map trip status to funnel stages
        CASE
            WHEN status = 'planned' AND start_date > CURRENT_DATE THEN 'awareness'
            WHEN status = 'planned' AND start_date <= CURRENT_DATE THEN 'consideration'
            WHEN status = 'ongoing' THEN 'intent'
            WHEN status = 'completed' THEN 'purchase'
            WHEN status = 'cancelled' THEN 'abandonment'
            ELSE 'unknown'
        END as funnel_stage,

        -- Map to standard conversion funnel
        CASE
            WHEN status = 'planned' THEN 'trip_planning'
            WHEN status = 'ongoing' THEN 'trip_started'
            WHEN status = 'completed' THEN 'trip_completed'
            ELSE 'trip_cancelled'
        END as conversion_stage,

        -- Calculate stage value
        CASE
            WHEN status = 'completed' AND actual_cost IS NOT NULL THEN actual_cost
            WHEN status = 'ongoing' AND budget IS NOT NULL THEN budget
            ELSE 0
        END as stage_value

    FROM {{ ref('stg_trips') }}
    WHERE has_destination = true AND has_dates = true
),

stage_progression AS (
    SELECT
        user_id,
        trip_id,
        trip_created_at,
        funnel_stage,
        conversion_stage,
        stage_value,

        -- Calculate days in each stage
        CASE
            WHEN funnel_stage = 'awareness' THEN
                DATEDIFF(day, trip_created_at, LEAST(start_date, CURRENT_DATE))
            WHEN funnel_stage = 'consideration' THEN
                DATEDIFF(day, trip_created_at, start_date)
            WHEN funnel_stage = 'intent' THEN
                DATEDIFF(day, start_date, LEAST(end_date, CURRENT_DATE))
            WHEN funnel_stage = 'purchase' THEN
                DATEDIFF(day, start_date, end_date)
            ELSE 0
        END as days_in_stage,

        -- Stage conversion indicators
        CASE
            WHEN funnel_stage IN ('intent', 'purchase') THEN true
            ELSE false
        END as reached_conversion,

        CASE
            WHEN funnel_stage = 'purchase' THEN true
            ELSE false
        END as completed_conversion

    FROM trip_stage_mapping
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

    -- Additional derived fields
    CASE
        WHEN days_in_stage <= 7 THEN 'fast'
        WHEN days_in_stage <= 30 THEN 'normal'
        WHEN days_in_stage <= 90 THEN 'slow'
        ELSE 'very_slow'
    END as stage_velocity,

    -- Data quality indicators
    CASE WHEN stage_value > 0 THEN true ELSE false END as has_value,
    CASE WHEN days_in_stage >= 0 THEN true ELSE false END as valid_timing

FROM stage_progression