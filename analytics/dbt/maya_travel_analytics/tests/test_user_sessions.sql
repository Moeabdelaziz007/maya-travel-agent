-- Test cases for user sessions analytics

-- Test 1: Ensure session data quality
SELECT
    'test_session_data_quality' as test_name,
    COUNT(*) as records_tested,
    COUNT(CASE WHEN valid_duration = true THEN 1 END) as valid_sessions,
    COUNT(CASE WHEN has_interaction = true THEN 1 END) as sessions_with_interaction,
    COUNT(CASE WHEN has_satisfaction_data = true THEN 1 END) as sessions_with_satisfaction
FROM {{ ref('fact_user_sessions') }}
HAVING COUNT(*) > 0;

-- Test 2: Validate engagement score calculation
SELECT
    'test_engagement_score_calculation' as test_name,
    COUNT(*) as records_tested,
    MIN(engagement_score) as min_engagement_score,
    MAX(engagement_score) as max_engagement_score,
    AVG(engagement_score) as avg_engagement_score
FROM {{ ref('fact_user_sessions') }}
WHERE engagement_score IS NOT NULL
HAVING MIN(engagement_score) >= 0 AND MAX(engagement_score) <= 100;

-- Test 3: Check session duration logic
SELECT
    'test_session_duration_logic' as test_name,
    COUNT(*) as records_tested,
    COUNT(CASE WHEN session_duration_minutes >= 0 THEN 1 END) as valid_durations,
    COUNT(CASE WHEN session_duration_minutes > 60 THEN 1 END) as long_sessions,
    COUNT(CASE WHEN session_duration_minutes <= 5 THEN 1 END) as short_sessions
FROM {{ ref('fact_user_sessions') }}
WHERE valid_duration = true;