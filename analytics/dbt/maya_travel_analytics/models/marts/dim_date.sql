{{ config(materialized='table') }}

-- Date dimension table for time-based analytics
-- Provides comprehensive date attributes for all analytics models

WITH date_series AS (
    SELECT
        -- Generate date series for the last 5 years and next 2 years
        DATEADD(day, seq, '2020-01-01') as date_day
    FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY 1) - 1 as seq
        FROM (VALUES (1), (1), (1), (1), (1)) -- Generate enough rows
        LIMIT 2557 -- Approximately 7 years
    )
),

date_attributes AS (
    SELECT
        date_day,

        -- Basic date parts
        EXTRACT(year FROM date_day) as year,
        EXTRACT(month FROM date_day) as month,
        EXTRACT(day FROM date_day) as day,
        EXTRACT(quarter FROM date_day) as quarter,
        EXTRACT(week FROM date_day) as week,
        EXTRACT(dow FROM date_day) as day_of_week,
        EXTRACT(doy FROM date_day) as day_of_year,

        -- Date names
        TO_CHAR(date_day, 'Day') as day_name,
        TO_CHAR(date_day, 'Month') as month_name,
        TO_CHAR(date_day, 'YYYY-MM') as year_month,
        TO_CHAR(date_day, 'YYYY-Q') as year_quarter,

        -- Weekend and holiday indicators (simplified)
        CASE
            WHEN EXTRACT(dow FROM date_day) IN (0, 6) THEN true
            ELSE false
        END as is_weekend,

        CASE
            WHEN EXTRACT(month FROM date_day) = 12 AND EXTRACT(day FROM date_day) >= 25 THEN true
            WHEN EXTRACT(month FROM date_day) = 1 AND EXTRACT(day FROM date_day) <= 5 THEN true
            ELSE false
        END as is_holiday_season,

        -- Business day indicator
        CASE
            WHEN EXTRACT(dow FROM date_day) NOT IN (0, 6) THEN true
            ELSE false
        END as is_business_day,

        -- Season classification
        CASE
            WHEN EXTRACT(month FROM date_day) IN (12, 1, 2) THEN 'winter'
            WHEN EXTRACT(month FROM date_day) IN (3, 4, 5) THEN 'spring'
            WHEN EXTRACT(month FROM date_day) IN (6, 7, 8) THEN 'summer'
            WHEN EXTRACT(month FROM date_day) IN (9, 10, 11) THEN 'autumn'
            ELSE 'unknown'
        END as season,

        -- Travel season classification
        CASE
            WHEN EXTRACT(month FROM date_day) IN (6, 7, 8) THEN 'peak_travel'
            WHEN EXTRACT(month FROM date_day) IN (3, 4, 5, 9, 10, 11) THEN 'shoulder_travel'
            WHEN EXTRACT(month FROM date_day) IN (12, 1, 2) THEN 'off_peak_travel'
            ELSE 'unknown'
        END as travel_season

    FROM date_series
    WHERE date_day BETWEEN '2020-01-01' AND '2027-12-31'
)

SELECT
    date_day,
    year,
    month,
    day,
    quarter,
    week,
    day_of_week,
    day_of_year,
    day_name,
    month_name,
    year_month,
    year_quarter,
    is_weekend,
    is_holiday_season,
    is_business_day,
    season,
    travel_season,

    -- Additional useful date calculations
    DATEADD(day, -1, date_day) as previous_day,
    DATEADD(day, 1, date_day) as next_day,
    DATEADD(month, 1, date_day) as next_month,
    DATEADD(year, 1, date_day) as next_year,

    -- Week start and end
    DATEADD(day, -day_of_week, date_day) as week_start,
    DATEADD(day, 6 - day_of_week, date_day) as week_end,

    -- Month start and end
    DATE_TRUNC('month', date_day) as month_start,
    DATEADD(day, -1, DATEADD(month, 1, DATE_TRUNC('month', date_day))) as month_end,

    -- Quarter start and end
    DATE_TRUNC('quarter', date_day) as quarter_start,
    DATEADD(day, -1, DATEADD(quarter, 1, DATE_TRUNC('quarter', date_day))) as quarter_end,

    -- Year start and end
    DATE_TRUNC('year', date_day) as year_start,
    DATEADD(day, -1, DATEADD(year, 1, DATE_TRUNC('year', date_day))) as year_end

FROM date_attributes