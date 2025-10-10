{{ config(materialized='table') }}

-- Dimension table for business KPIs and growth metrics
-- Provides aggregated business performance indicators

WITH kpi_aggregation AS (
    SELECT
        DATE_TRUNC('month', trip_created_at) as kpi_month,

        -- Revenue metrics
        SUM(final_revenue_amount) as monthly_revenue,
        AVG(final_revenue_amount) as avg_revenue_per_trip,
        COUNT(CASE WHEN completed_trip = 1 THEN 1 END) as completed_trips,
        COUNT(CASE WHEN cancelled_trip = 1 THEN 1 END) as cancelled_trips,

        -- User growth metrics
        COUNT(DISTINCT user_id) as active_users,
        COUNT(DISTINCT CASE WHEN user_total_trips = 1 THEN user_id END) as new_users,
        COUNT(DISTINCT CASE WHEN user_total_trips > 1 THEN user_id END) as returning_users,

        -- Trip metrics
        COUNT(DISTINCT trip_id) as total_trips,
        AVG(trip_duration_days) as avg_trip_duration,
        COUNT(DISTINCT destination) as unique_destinations,

        -- Payment metrics
        SUM(CASE WHEN payment_status = 'succeeded' THEN payment_amount ELSE 0 END) as successful_payments,
        COUNT(CASE WHEN payment_status = 'succeeded' THEN 1 END) as successful_payment_count,

        -- Engagement metrics
        AVG(CASE WHEN engagement_level = 'high' THEN 1
                 WHEN engagement_level = 'medium' THEN 2
                 WHEN engagement_level = 'low' THEN 3
                 ELSE 4 END) as avg_engagement_score,

        -- Budget performance
        AVG(budget_variance_percentage) as avg_budget_variance,
        SUM(profit_margin) as total_profit_margin

    FROM {{ ref('fact_business_metrics') }}
    WHERE valid_revenue = true
    GROUP BY DATE_TRUNC('month', trip_created_at)
),

kpi_analysis AS (
    SELECT
        ka.kpi_month,
        ka.monthly_revenue,
        ka.avg_revenue_per_trip,
        ka.completed_trips,
        ka.cancelled_trips,
        ka.active_users,
        ka.new_users,
        ka.returning_users,
        ka.total_trips,
        ka.avg_trip_duration,
        ka.unique_destinations,
        ka.successful_payments,
        ka.successful_payment_count,
        ka.avg_engagement_score,
        ka.avg_budget_variance,
        ka.total_profit_margin,

        -- Calculate key business KPIs
        CASE
            WHEN ka.total_trips > 0 THEN
                (ka.completed_trips::FLOAT / ka.total_trips) * 100
            ELSE 0
        END as completion_rate_percentage,

        CASE
            WHEN ka.active_users > 0 THEN
                (ka.returning_users::FLOAT / ka.active_users) * 100
            ELSE 0
        END as retention_rate_percentage,

        CASE
            WHEN ka.active_users > 0 THEN
                (ka.new_users::FLOAT / ka.active_users) * 100
            ELSE 0
        END as acquisition_rate_percentage,

        -- Revenue growth (month over month)
        LAG(ka.monthly_revenue) OVER (ORDER BY ka.kpi_month) as previous_month_revenue,
        CASE
            WHEN LAG(ka.monthly_revenue) OVER (ORDER BY ka.kpi_month) > 0 THEN
                ((ka.monthly_revenue - LAG(ka.monthly_revenue) OVER (ORDER BY ka.kpi_month)) /
                 LAG(ka.monthly_revenue) OVER (ORDER BY ka.kpi_month)) * 100
            ELSE 0
        END as revenue_growth_percentage,

        -- User growth
        LAG(ka.active_users) OVER (ORDER BY ka.kpi_month) as previous_month_users,
        CASE
            WHEN LAG(ka.active_users) OVER (ORDER BY ka.kpi_month) > 0 THEN
                ((ka.active_users - LAG(ka.active_users) OVER (ORDER BY ka.kpi_month)) /
                 LAG(ka.active_users) OVER (ORDER BY ka.kpi_month)) * 100
            ELSE 0
        END as user_growth_percentage,

        -- Business health indicators
        CASE
            WHEN ka.completion_rate_percentage >= 80 AND ka.retention_rate_percentage >= 60 THEN 'excellent'
            WHEN ka.completion_rate_percentage >= 60 AND ka.retention_rate_percentage >= 40 THEN 'good'
            WHEN ka.completion_rate_percentage >= 40 OR ka.retention_rate_percentage >= 20 THEN 'fair'
            ELSE 'needs_improvement'
        END as business_health_status

    FROM kpi_aggregation ka
)

SELECT
    kpi_month,
    monthly_revenue,
    avg_revenue_per_trip,
    completed_trips,
    cancelled_trips,
    active_users,
    new_users,
    returning_users,
    total_trips,
    avg_trip_duration,
    unique_destinations,
    successful_payments,
    successful_payment_count,
    avg_engagement_score,
    avg_budget_variance,
    total_profit_margin,
    completion_rate_percentage,
    retention_rate_percentage,
    acquisition_rate_percentage,
    previous_month_revenue,
    revenue_growth_percentage,
    previous_month_users,
    user_growth_percentage,
    business_health_status,

    -- Data quality indicators
    CASE WHEN monthly_revenue >= 0 THEN true ELSE false END as valid_revenue_data,
    CASE WHEN active_users > 0 THEN true ELSE false END as has_user_data,
    CASE WHEN total_trips > 0 THEN true ELSE false END as has_trip_data

FROM kpi_analysis