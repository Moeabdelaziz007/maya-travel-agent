{{ config(materialized='view') }}

-- Staging model for conversations from Supabase
-- This model cleans and standardizes conversation data

SELECT
    -- Primary identifiers
    id as conversation_id,
    user_id,
    session_id,

    -- Message details
    message_type,
    content,

    -- Performance metrics
    response_time_ms,
    satisfaction_score,

    -- Metadata
    metadata,

    -- Timestamps
    created_at,

    -- Derived fields
    CASE
        WHEN message_type = 'user' THEN 'incoming'
        WHEN message_type = 'assistant' THEN 'outgoing'
        ELSE 'system'
    END as message_direction,

    CASE
        WHEN response_time_ms < 1000 THEN 'fast'
        WHEN response_time_ms < 3000 THEN 'normal'
        WHEN response_time_ms < 10000 THEN 'slow'
        ELSE 'very_slow'
    END as response_speed_category,

    LENGTH(content) as content_length,

    CASE
        WHEN satisfaction_score >= 4 THEN 'satisfied'
        WHEN satisfaction_score >= 3 THEN 'neutral'
        WHEN satisfaction_score >= 1 THEN 'dissatisfied'
        ELSE 'not_rated'
    END as satisfaction_category,

    -- Data quality flags
    CASE WHEN content IS NOT NULL AND content != '' THEN true ELSE false END as has_content,
    CASE WHEN response_time_ms IS NOT NULL THEN true ELSE false END as has_response_time,
    CASE WHEN satisfaction_score IS NOT NULL THEN true ELSE false END as has_satisfaction_score

FROM {{ source('supabase', 'conversations') }}

-- Only include conversations from the last 2 years
WHERE created_at >= DATEADD(year, -2, CURRENT_DATE)