{{ config(materialized='table') }}

-- Fact table for business KPIs and revenue metrics
-- Combines trip, payment, and user data for business analytics

WITH business_metrics_base AS (
    SELECT
        t.user_id,
        t.trip_id,
        t.created_at as trip_created_at,
        t.start_date,
        t.end_date,
        t.budget,
        t.actual_cost,
        t.status as trip_status,
        t.destination,
        t.country,

        -- Payment information
        p.amount as payment_amount,
        p.currency as payment_currency,
        p.status as payment_status,
        p.payment_method,
        p.created_at as payment_created_at,

        -- User information
        u.engagement_level,
        u.travel_style,
        u.budget_range,
        u.total_trips as user_total_trips,
        u.total_spent as user_total_spent,
        u.last_active,

        -- Calculate business metrics
        CASE
            WHEN t.actual_cost IS NOT NULL THEN t.actual_cost
            WHEN t.budget IS NOT NULL THEN t.budget
            ELSE 0
        END as revenue_amount,

        CASE
            WHEN t.status = 'completed' THEN 1
            ELSE 0
        END as completed_trip,

        CASE
            WHEN t.status = 'cancelled' THEN 1
            ELSE 0
        END as cancelled_trip,

        -- Revenue categories
        CASE
            WHEN t.actual_cost >= 10000 THEN 'premium'
            WHEN t.actual_cost >= 5000 THEN 'high_value'
            WHEN t.actual_cost >= 2000 THEN 'medium_value'
            WHEN t.actual_cost > 0 THEN 'low_value'
            ELSE 'no_value'
        END as revenue_category

    FROM {{ ref('stg_trips') }} t
    LEFT JOIN {{ ref('stg_stripe_payments') }} p ON t.user_id = p.customer_id
    LEFT JOIN {{ ref('stg_users') }} u ON t.user_id = u.user_id
    WHERE t.has_budget = true
),

business_aggregation AS (
    SELECT
        bmb.user_id,
        bmb.trip_id,
        bmb.trip_created_at,
        bmb.start_date,
        bmb.end_date,
        bmb.budget,
        bmb.actual_cost,
        bmb.trip_status,
        bmb.destination,
        bmb.country,
        bmb.payment_amount,
        bmb.payment_currency,
        bmb.payment_status,
        bmb.payment_method,
        bmb.payment_created_at,
        bmb.engagement_level,
        bmb.travel_style,
        bmb.budget_range,
        bmb.user_total_trips,
        bmb.user_total_spent,
        bmb.last_active,
        bmb.revenue_amount,
        bmb.completed_trip,
        bmb.cancelled_trip,
        bmb.revenue_category,

        -- Calculate additional KPIs
        CASE
            WHEN bmb.budget > 0 AND bmb.actual_cost IS NOT NULL THEN
                ((bmb.actual_cost - bmb.budget) / bmb.budget) * 100
            ELSE 0
        END as budget_variance_percentage,

        CASE
            WHEN bmb.payment_amount IS NOT NULL AND bmb.payment_amount > 0 THEN
                bmb.payment_amount
            ELSE bmb.revenue_amount
        END as final_revenue_amount,

        -- Trip profitability
        CASE
            WHEN bmb.actual_cost IS NOT NULL AND bmb.budget IS NOT NULL THEN
                bmb.budget - bmb.actual_cost
            ELSE 0
        END as profit_margin,

        -- Customer lifetime value indicators
        CASE
            WHEN bmb.user_total_spent > 0 THEN
                bmb.user_total_spent / NULLIF(bmb.user_total_trips, 0)
            ELSE 0
        END as avg_spend_per_trip

    FROM business_metrics_base bmb
)

SELECT
    user_id,
    trip_id,
    trip_created_at,
    start_date,
    end_date,
    budget,
    actual_cost,
    trip_status,
    destination,
    country,
    payment_amount,
    payment_currency,
    payment_status,
    payment_method,
    payment_created_at,
    engagement_level,
    travel_style,
    budget_range,
    user_total_trips,
    user_total_spent,
    last_active,
    revenue_amount,
    completed_trip,
    cancelled_trip,
    revenue_category,
    budget_variance_percentage,
    final_revenue_amount,
    profit_margin,
    avg_spend_per_trip,

    -- Data quality indicators
    CASE WHEN revenue_amount >= 0 THEN true ELSE false END as valid_revenue,
    CASE WHEN trip_id IS NOT NULL THEN true ELSE false END as has_trip_data,
    CASE WHEN payment_amount IS NOT NULL THEN true ELSE false END as has_payment_data

FROM business_aggregation