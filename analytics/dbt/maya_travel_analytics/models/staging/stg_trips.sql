{{ config(materialized='view') }}

-- Staging model for trips from Supabase
-- This model cleans and standardizes trip data

SELECT
    -- Primary identifiers
    id as trip_id,
    user_id,

    -- Trip details
    destination,
    country,
    start_date,
    end_date,
    budget,
    actual_cost,

    -- Trip characteristics
    status,
    travel_style,
    group_size,
    trip_purpose,
    accommodation_type,
    transportation_method,
    special_requirements,

    -- AI and feedback data
    ai_recommendations,
    personalized_score,
    satisfaction_score,
    feedback,

    -- Media and documents
    image_url,
    documents,

    -- Timestamps
    created_at,
    updated_at,

    -- Derived fields
    DATEDIFF(day, start_date, end_date) + 1 as trip_duration_days,
    CASE
        WHEN actual_cost IS NOT NULL AND budget IS NOT NULL THEN
            CASE
                WHEN actual_cost <= budget THEN 'under_budget'
                WHEN actual_cost <= budget * 1.1 THEN 'slightly_over'
                WHEN actual_cost <= budget * 1.25 THEN 'moderately_over'
                ELSE 'significantly_over'
            END
        ELSE NULL
    END as budget_performance,

    CASE
        WHEN status = 'completed' THEN 'completed'
        WHEN status = 'ongoing' THEN 'active'
        WHEN status = 'planned' THEN 'planned'
        WHEN status = 'cancelled' THEN 'cancelled'
        ELSE 'unknown'
    END as trip_status_clean,

    CASE
        WHEN satisfaction_score >= 4 THEN 'very_satisfied'
        WHEN satisfaction_score >= 3 THEN 'satisfied'
        WHEN satisfaction_score >= 2 THEN 'neutral'
        WHEN satisfaction_score >= 1 THEN 'dissatisfied'
        ELSE 'not_rated'
    END as satisfaction_category,

    -- Data quality flags
    CASE WHEN destination IS NOT NULL THEN true ELSE false END as has_destination,
    CASE WHEN start_date IS NOT NULL AND end_date IS NOT NULL THEN true ELSE false END as has_dates,
    CASE WHEN budget IS NOT NULL THEN true ELSE false END as has_budget

FROM {{ source('supabase', 'trips') }}

-- Only include trips from the last 3 years
WHERE created_at >= DATEADD(year, -3, CURRENT_DATE)