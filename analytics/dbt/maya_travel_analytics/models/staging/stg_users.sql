{{ config(materialized='view') }}

-- Staging model for users from Supabase
-- This model cleans and standardizes user data

SELECT
    -- Primary identifiers
    id as user_id,
    email,
    telegram_id,
    telegram_username,

    -- Personal information
    full_name,
    date_of_birth,
    gender,
    nationality,
    preferred_language,
    timezone,

    -- Travel preferences
    travel_style,
    accommodation_preference,
    transportation_preference,
    food_preferences,
    budget_range,
    group_size,

    -- Cultural preferences
    cultural_background,
    religious_requirements,
    special_needs,

    -- AI interaction preferences
    preferred_response_length,
    humor_preference,
    formality_level,
    information_density,

    -- Analytics fields
    total_trips,
    total_spent,
    average_trip_duration,
    loyalty_score,
    engagement_level,
    satisfaction_trend,
    recommendation_accuracy,

    -- Timestamps
    created_at,
    updated_at,
    last_active,

    -- Derived fields
    EXTRACT(year FROM AGE(CURRENT_DATE, date_of_birth)) as age,
    CASE
        WHEN last_active >= CURRENT_DATE - INTERVAL '7 days' THEN 'active'
        WHEN last_active >= CURRENT_DATE - INTERVAL '30 days' THEN 'recent'
        WHEN last_active >= CURRENT_DATE - INTERVAL '90 days' THEN 'inactive'
        ELSE 'churned'
    END as user_status,

    -- Data quality flags
    CASE WHEN email IS NOT NULL THEN true ELSE false END as has_email,
    CASE WHEN telegram_id IS NOT NULL THEN true ELSE false END as has_telegram,
    CASE WHEN full_name IS NOT NULL THEN true ELSE false END as has_name

FROM {{ source('supabase', 'users') }}

-- Only include users created in the last 3 years
WHERE created_at >= DATEADD(year, -3, CURRENT_DATE)