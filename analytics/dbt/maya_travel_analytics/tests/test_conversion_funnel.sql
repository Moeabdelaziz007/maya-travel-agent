-- Test cases for conversion funnel analytics

-- Test 1: Validate conversion rate calculations
SELECT
    'test_conversion_rate_calculation' as test_name,
    COUNT(*) as records_tested,
    MIN(conversion_rate_percentage) as min_conversion_rate,
    MAX(conversion_rate_percentage) as max_conversion_rate,
    AVG(conversion_rate_percentage) as avg_conversion_rate
FROM {{ ref('dim_conversion_funnel') }}
WHERE has_data = true
HAVING MIN(conversion_rate_percentage) >= 0 AND MAX(conversion_rate_percentage) <= 100;

-- Test 2: Check funnel stage progression
SELECT
    'test_funnel_stage_progression' as test_name,
    COUNT(*) as records_tested,
    COUNT(CASE WHEN stage_order IS NOT NULL THEN 1 END) as stages_with_order,
    COUNT(CASE WHEN has_progression_data = true THEN 1 END) as stages_with_progression
FROM {{ ref('fact_trip_conversion') }}
WHERE valid_value = true;

-- Test 3: Validate stage efficiency metrics
SELECT
    'test_stage_efficiency_metrics' as test_name,
    COUNT(*) as records_tested,
    COUNT(CASE WHEN stage_efficiency IN ('fast', 'normal', 'slow', 'very_slow') THEN 1 END) as valid_efficiency_categories,
    COUNT(CASE WHEN stage_velocity IN ('fast', 'normal', 'slow', 'very_slow') THEN 1 END) as valid_velocity_categories
FROM {{ ref('fact_trip_conversion') }}
WHERE valid_duration = true;