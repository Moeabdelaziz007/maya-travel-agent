{{ config(materialized='view') }}

-- Staging model for Telegram messages from Fivetran
-- This model cleans and standardizes raw Telegram data

SELECT
    -- Primary identifiers
    message_id,
    chat_id,
    user_id,

    -- User information
    username,
    first_name,
    last_name,

    -- Message content
    text,
    message_type,

    -- Metadata
    date as message_timestamp,
    has_media,
    processed_at,

    -- Derived fields
    CASE
        WHEN text IS NOT NULL AND text != '' THEN LENGTH(text)
        ELSE 0
    END as message_length,

    CASE
        WHEN message_type = 'text' THEN 'conversation'
        WHEN message_type IN ('photo', 'document', 'audio', 'video') THEN 'media'
        WHEN message_type = 'sticker' THEN 'fun'
        ELSE 'other'
    END as message_category,

    -- Data quality flags
    CASE WHEN user_id IS NOT NULL THEN true ELSE false END as has_user_id,
    CASE WHEN text IS NOT NULL AND text != '' THEN true ELSE false END as has_content

FROM {{ source('fivetran_telegram', 'messages') }}

-- Only include messages from the last 2 years to keep dataset manageable
WHERE date >= DATEADD(day, -730, CURRENT_DATE)