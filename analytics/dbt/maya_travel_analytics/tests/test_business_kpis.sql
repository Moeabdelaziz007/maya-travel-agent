-- Test cases for business KPIs

-- Test 1: Validate revenue calculations
SELECT
    'test_revenue_calculations' as test_name,
    COUNT(*) as records_tested,
    MIN(final_revenue_amount) as min_revenue,
    MAX(final_revenue_amount) as max_revenue,
    AVG(final_revenue_amount) as avg_revenue,
    SUM(final_revenue_amount) as total_revenue
FROM {{ ref('fact_business_metrics') }}
WHERE valid_revenue = true
HAVING MIN(final_revenue_amount) >= 0;

-- Test 2: Check business health status logic
SELECT
    'test_business_health_logic' as test_name,
    COUNT(*) as records_tested,
    COUNT(CASE WHEN business_health_status IN ('excellent', 'good', 'fair', 'needs_improvement') THEN 1 END) as valid_health_statuses
FROM {{ ref('dim_business_kpis') }}
WHERE has_user_data = true AND has_trip_data = true;

-- Test 3: Validate growth rate calculations
SELECT
    'test_growth_rate_calculations' as test_name,
    COUNT(*) as records_tested,
    MIN(revenue_growth_percentage) as min_growth_rate,
    MAX(revenue_growth_percentage) as max_growth_rate,
    AVG(revenue_growth_percentage) as avg_growth_rate
FROM {{ ref('dim_business_kpis') }}
WHERE valid_revenue_data = true;