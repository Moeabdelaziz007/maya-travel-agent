{{ config(materialized='table') }}

-- Dimension table for destinations
-- Provides comprehensive destination information for analytics

SELECT
    id as destination_id,
    name,
    country,
    region,
    latitude,
    longitude,

    -- Destination characteristics
    description,
    best_time_to_visit,
    climate_info,
    cultural_highlights,
    local_customs,

    -- Practical information
    currency,
    language,
    timezone,
    visa_requirements,

    -- Ratings and appeal
    overall_rating,
    safety_rating,
    cost_rating,
    family_friendly,
    halal_friendly,

    -- Media and search
    image_url,
    gallery_urls,
    search_keywords,
    popular_activities,

    -- Timestamps
    created_at,
    updated_at,

    -- Derived fields for analytics
    CASE
        WHEN cost_rating = '$' THEN 'budget'
        WHEN cost_rating = '$$' THEN 'moderate'
        WHEN cost_rating = '$$$' THEN 'expensive'
        WHEN cost_rating = '$$$$' THEN 'luxury'
        ELSE 'unknown'
    END as cost_category,

    CASE
        WHEN overall_rating >= 4.5 THEN 'excellent'
        WHEN overall_rating >= 4.0 THEN 'very_good'
        WHEN overall_rating >= 3.5 THEN 'good'
        WHEN overall_rating >= 3.0 THEN 'average'
        WHEN overall_rating >= 2.0 THEN 'below_average'
        ELSE 'poor'
    END as rating_category,

    CASE
        WHEN safety_rating >= 4.0 THEN 'very_safe'
        WHEN safety_rating >= 3.0 THEN 'safe'
        WHEN safety_rating >= 2.0 THEN 'moderate_risk'
        ELSE 'high_risk'
    END as safety_category,

    -- Muslim-friendly indicators
    CASE
        WHEN halal_friendly = true AND family_friendly = true THEN 'muslim_family_friendly'
        WHEN halal_friendly = true THEN 'muslim_friendly'
        WHEN family_friendly = true THEN 'family_friendly'
        ELSE 'general'
    END as audience_category,

    -- Geographic region classification
    CASE
        WHEN country IN ('Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman') THEN 'gcc'
        WHEN country IN ('Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria') THEN 'mena'
        WHEN country IN ('Turkey', 'Malaysia', 'Indonesia') THEN 'muslim_majority'
        WHEN country IN ('UK', 'USA', 'Canada', 'Australia', 'France', 'Germany') THEN 'western'
        WHEN country IN ('Thailand', 'Singapore', 'Japan', 'South Korea') THEN 'asia_pacific'
        ELSE 'other'
    END as geographic_region,

    -- Data quality indicators
    CASE WHEN name IS NOT NULL THEN true ELSE false END as has_basic_info,
    CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN true ELSE false END as has_coordinates,
    CASE WHEN overall_rating > 0 THEN true ELSE false END as has_rating

FROM {{ source('supabase', 'destinations') }}