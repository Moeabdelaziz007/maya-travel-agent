{{ config(materialized='view') }}

-- Staging model for Stripe payments from Fivetran
-- This model cleans and standardizes raw Stripe payment data

SELECT
    -- Primary identifiers
    id as payment_id,
    customer_id,

    -- Financial information
    amount,
    currency,

    -- Payment details
    payment_method,
    status,
    description,

    -- Timestamps
    created as payment_created_at,
    processed_at,

    -- Metadata and additional data
    metadata,
    CASE
        WHEN metadata IS NOT NULL AND metadata != '{}' THEN true
        ELSE false
    END as has_metadata,

    -- Derived fields for analytics
    CASE
        WHEN status = 'succeeded' THEN 'completed'
        WHEN status = 'pending' THEN 'pending'
        WHEN status = 'failed' THEN 'failed'
        WHEN status = 'canceled' THEN 'cancelled'
        ELSE 'unknown'
    END as payment_status_clean,

    CASE
        WHEN amount > 0 THEN 'credit'
        WHEN amount < 0 THEN 'debit'
        ELSE 'zero'
    END as transaction_type,

    -- Data quality flags
    CASE WHEN customer_id IS NOT NULL THEN true ELSE false END as has_customer,
    CASE WHEN amount IS NOT NULL AND amount != 0 THEN true ELSE false END as has_amount,
    CASE WHEN currency IS NOT NULL THEN true ELSE false END as has_currency

FROM {{ source('fivetran_stripe', 'payments') }}

-- Only include payments from the last 2 years
WHERE created >= DATEADD(day, -730, CURRENT_DATE)