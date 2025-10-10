# Dataiku Integration Guide

## Overview

This document explains how to integrate the Maya Travel Agent dbt analytics models with Dataiku for advanced analytics, machine learning, and dashboard creation.

## Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   dbt Models    │    │    Dataiku      │
│   PostgreSQL    │───▶│   (Analytics)   │───▶│   Platform      │
│                 │    │                 │    │                 │
│ Raw Data        │    │ Staging →       │    │ ML Models       │
│ - Users         │    │ Intermediate →  │    │ Dashboards      │
│ - Conversations │    │ Marts           │    │ Predictions     │
│ - Trips         │    │                 │    │                 │
│ - Payments      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Dataiku Project Configuration

1. **Create New Project**:
   - Open Dataiku DSS
   - Create a new project: "Maya Travel Analytics"
   - Select appropriate project permissions

2. **Configure Database Connection**:
   - Go to Project Administration → Connections
   - Add new PostgreSQL connection
   - Configure with your Supabase credentials:
     ```yaml
     host: your_supabase_host
     port: 5432
     database: postgres
     username: your_username
     password: your_password
     ```

### 2. Import dbt Models as Datasets

#### Option A: Direct Database Connection
1. **Create Dataset**:
   - Administration → Datasets → New Dataset
   - Select "PostgreSQL" connection type
   - Choose your configured connection

2. **Import Tables**:
   - Import fact tables:
     - `analytics.fact_user_sessions`
     - `analytics.fact_trip_conversion`
     - `analytics.fact_system_performance`
     - `analytics.fact_business_metrics`

   - Import dimension tables:
     - `analytics.dim_user_engagement`
     - `analytics.dim_conversion_funnel`
     - `analytics.dim_system_health`
     - `analytics.dim_business_kpis`
     - `analytics.dim_date`
     - `analytics.dim_destinations`

#### Option B: Export to Files (Alternative)
```bash
# Export dbt models to CSV for Dataiku import
cd analytics/dbt/maya_travel_analytics

# Generate CSV exports
dbt run --target prod
psql $DATABASE_URL -c "
\copy analytics.fact_user_sessions TO 'dataiku_exports/fact_user_sessions.csv' CSV HEADER
\copy analytics.fact_trip_conversion TO 'dataiku_exports/fact_trip_conversion.csv' CSV HEADER
\copy analytics.fact_system_performance TO 'dataiku_exports/fact_system_performance.csv' CSV HEADER
\copy analytics.fact_business_metrics TO 'dataiku_exports/fact_business_metrics.csv' CSV HEADER
"
```

### 3. Create Dataiku Flow

1. **Build Analytics Flow**:
   - Create new Flow: "Maya Travel Analytics"
   - Add imported datasets to the flow
   - Connect related datasets (e.g., fact tables to dimension tables)

2. **Join Datasets**:
   - Use "Join" recipe to combine fact and dimension tables
   - Example joins:
     - `fact_user_sessions` ↔ `dim_user_engagement` (on user_id)
     - `fact_trip_conversion` ↔ `dim_date` (on trip_created_at)
     - `fact_business_metrics` ↔ `dim_destinations` (on destination)

### 4. Advanced Analytics Setup

#### Machine Learning Models

1. **Churn Prediction**:
   - Use `dim_user_engagement` and `fact_user_sessions`
   - Features: engagement_score, session_frequency, satisfaction_score
   - Target: user_status (active/churned)

2. **Trip Success Prediction**:
   - Use `fact_trip_conversion` and user data
   - Features: user_engagement_level, trip_budget, destination_category
   - Target: trip_completion_rate

3. **Revenue Forecasting**:
   - Use `dim_business_kpis` and historical data
   - Features: monthly_revenue, user_growth, completion_rates
   - Predict future revenue and growth trends

#### Dashboard Creation

1. **Executive Dashboard**:
   - Key metrics: monthly_revenue, user_growth, completion_rates
   - Visualizations: trend charts, KPI cards, geographic maps

2. **User Behavior Dashboard**:
   - Session analytics, engagement patterns, satisfaction trends
   - Visualizations: heatmaps, cohort analysis, funnel charts

3. **System Performance Dashboard**:
   - Response times, error rates, system health status
   - Visualizations: performance trends, alert indicators

## Automation and Scheduling

### 1. Automated Data Refresh

```bash
# Set up cron job for daily refresh
crontab -e

# Add entry for 2 AM daily refresh
0 2 * * * cd /path/to/dbt/project && dbt run --target prod
```

### 2. Dataiku Scenario Setup

1. **Create Scenario**:
   - Go to Scenarios → New Scenario
   - Choose "Build/Train" scenario type

2. **Configure Steps**:
   - Step 1: Run dbt models (external script)
   - Step 2: Refresh datasets
   - Step 3: Retrain ML models
   - Step 4: Update dashboards

3. **Set Schedule**:
   - Daily execution at 3 AM
   - Email notifications on failure

## Best Practices

### 1. Data Governance
- **Data Quality**: Use dbt tests to ensure data quality before Dataiku import
- **Lineage**: Maintain clear data lineage from source to final datasets
- **Documentation**: Document all transformations and business logic

### 2. Performance Optimization
- **Partitioning**: Use date partitioning for large fact tables
- **Indexing**: Create appropriate indexes on join keys
- **Caching**: Enable Dataiku dataset caching for frequently used data

### 3. Security Considerations
- **Access Control**: Configure proper permissions in both dbt and Dataiku
- **Data Masking**: Mask sensitive user data in development environments
- **Audit Logging**: Enable audit trails for data access

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify Supabase credentials and network connectivity
   - Check firewall settings and IP whitelisting

2. **Data Type Mismatches**:
   - Ensure consistent data types between dbt and Dataiku
   - Handle NULL values appropriately

3. **Performance Issues**:
   - Optimize query performance in dbt models
   - Use Dataiku's performance profiling tools

### Support Resources

- **dbt Documentation**: https://docs.getdbt.com/
- **Dataiku Documentation**: https://doc.dataiku.com/
- **Supabase Documentation**: https://supabase.com/docs

## Integration Examples

### Example 1: User Segmentation Analysis

```python
# Dataiku Python recipe for user segmentation
import dataiku
import pandas as pd
from sklearn.cluster import KMeans

# Load user engagement data
user_engagement = dataiku.Dataset("dim_user_engagement").get_dataframe()

# Prepare features for clustering
features = ['total_sessions', 'avg_engagement_score', 'total_session_time_minutes']
X = user_engagement[features].fillna(0)

# Perform clustering
kmeans = KMeans(n_clusters=4, random_state=42)
user_engagement['segment'] = kmeans.fit_predict(X)

# Save results
output_dataset = dataiku.Dataset("user_segments")
output_dataset.write_with_schema(user_engagement)
```

### Example 2: Revenue Forecasting

```python
# Dataiku Python recipe for revenue forecasting
import dataiku
import pandas as pd
from prophet import Prophet

# Load business KPIs data
business_kpis = dataiku.Dataset("dim_business_kpis").get_dataframe()

# Prepare data for Prophet
revenue_data = business_kpis[['kpi_month', 'monthly_revenue']].rename(
    columns={'kpi_month': 'ds', 'monthly_revenue': 'y'}
)

# Fit Prophet model
model = Prophet()
model.fit(revenue_data)

# Generate future predictions
future = model.make_future_dataframe(periods=12, freq='M')
forecast = model.predict(future)

# Save forecast
forecast_dataset = dataiku.Dataset("revenue_forecast")
forecast_dataset.write_with_schema(forecast)
```

## Maintenance and Monitoring

### 1. Regular Maintenance Tasks
- Monitor dbt model run times and success rates
- Check data quality test results
- Update Dataiku scenarios as needed
- Review and optimize ML model performance

### 2. Monitoring Setup
- Set up alerts for failed dbt runs
- Monitor Dataiku scenario execution
- Track data freshness and volume changes
- Alert on significant metric changes

## Version Control

### Git Integration
```bash
# Initialize git repository
cd analytics/dbt/maya_travel_analytics
git init

# Add Dataiku project files to .gitignore
echo "dataiku_project.zip" >> .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__/" >> .gitignore

# Commit changes
git add .
git commit -m "Initial dbt models setup"
```

This integration enables powerful analytics capabilities by combining dbt's data transformation strengths with Dataiku's advanced analytics and machine learning features.