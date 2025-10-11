# Amrikyy Travel Agent Analytics - dbt Project

## Overview

This dbt project provides comprehensive analytics models for the Amrikyy Travel Agent platform, enabling data-driven insights into user behavior, conversion funnels, system performance, and business KPIs.

## Project Structure

```
analytics/dbt/amrikyy_travel_analytics/
├── models/
│   ├── staging/                    # Raw data staging models
│   │   ├── stg_telegram_messages.sql
│   │   ├── stg_stripe_payments.sql
│   │   ├── stg_users.sql
│   │   ├── stg_conversations.sql
│   │   └── stg_trips.sql
│   ├── intermediate/               # Intermediate transformation models
│   │   ├── int_user_sessions.sql
│   │   ├── int_trip_funnel_stages.sql
│   │   └── int_performance_metrics.sql
│   └── marts/                      # Analytics-ready fact and dimension tables
│       ├── user_behavior/
│       │   ├── fact_user_sessions.sql
│       │   └── dim_user_engagement.sql
│       ├── conversion_funnel/
│       │   ├── fact_trip_conversion.sql
│       │   └── dim_conversion_funnel.sql
│       ├── performance_metrics/
│       │   ├── fact_system_performance.sql
│       │   └── dim_system_health.sql
│       ├── business_kpis/
│       │   ├── fact_business_metrics.sql
│       │   └── dim_business_kpis.sql
│       ├── dim_date.sql
│       └── dim_destinations.sql
├── macros/                         # Reusable SQL macros
├── tests/                          # Data quality tests
├── analyses/                       # Ad-hoc analysis queries
├── seeds/                          # Static data files
├── dbt_project.yml                 # Project configuration
├── profiles.yml                    # Database connection profiles
└── .env                           # Environment variables
```

## Analytics Models

### 1. User Behavior Analytics
- **fact_user_sessions**: Session-level user engagement data
- **dim_user_engagement**: User-level engagement patterns and segmentation

### 2. Conversion Funnel Analytics
- **fact_trip_conversion**: Trip lifecycle and conversion tracking
- **dim_conversion_funnel**: Aggregated funnel performance metrics

### 3. Performance Metrics
- **fact_system_performance**: System response times and quality metrics
- **dim_system_health**: System health trends and monitoring

### 4. Business KPIs
- **fact_business_metrics**: Revenue and business performance data
- **dim_business_kpis**: Key performance indicators and growth metrics

### 5. Dimension Tables
- **dim_date**: Comprehensive date dimension for time-based analytics
- **dim_destinations**: Destination information and characteristics

## Setup Instructions

### Prerequisites
- Python 3.8+
- dbt-core
- PostgreSQL client libraries
- Access to Supabase database

### Installation

1. **Install dbt**:
```bash
pip install dbt-core dbt-postgres
```

2. **Navigate to project directory**:
```bash
cd analytics/dbt/amrikyy_travel_analytics
```

3. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your Supabase connection details
```

4. **Install dependencies**:
```bash
dbt deps
```

5. **Test database connection**:
```bash
dbt debug
```

6. **Run models**:
```bash
# Run all models
dbt run

# Run specific model
dbt run --select fact_user_sessions

# Run tests
dbt test
```

## Configuration

### Database Connection

The project connects to Supabase PostgreSQL using environment variables defined in `.env`:

```env
DB_HOST=your_supabase_host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
```

### Model Materialization

- **Staging models**: Views (for raw data access)
- **Intermediate models**: Views (for data transformations)
- **Mart models**: Tables (for analytics consumption)

## Data Sources

### Fivetran Connectors
- **Telegram**: User messages and interactions
- **Stripe**: Payment transactions and revenue data

### Supabase Tables
- **users**: User profiles and preferences
- **conversations**: Chat history and AI interactions
- **trips**: Trip planning and booking data
- **destinations**: Travel destination information

## Key Analytics Capabilities

### User Behavior Analysis
- Session duration and engagement scoring
- User segmentation by engagement level
- Interaction pattern analysis
- Satisfaction trend monitoring

### Conversion Funnel Tracking
- Trip planning to completion conversion rates
- Stage-by-stage funnel performance
- User journey mapping
- Conversion velocity analysis

### System Performance Monitoring
- Response time distribution and trends
- System health status tracking
- Error rate monitoring
- Performance benchmarking

### Business Intelligence
- Revenue tracking and forecasting
- User growth and retention metrics
- Trip completion and satisfaction rates
- Geographic and demographic insights

## Testing

Run data quality tests:
```bash
dbt test
```

Available test types:
- **Uniqueness**: Primary key validation
- **Not null**: Required field validation
- **Referential integrity**: Foreign key relationships
- **Accepted values**: Domain validation
- **Custom tests**: Business logic validation

## Documentation

Generate model documentation:
```bash
dbt docs generate
dbt docs serve
```

## Monitoring and Maintenance

### Automated Refresh
Set up cron jobs for regular model updates:
```bash
# Daily refresh at 2 AM
0 2 * * * cd /path/to/project && dbt run --target prod

# Test runs before production deployment
dbt run --select staging --target dev
dbt test --target dev
```

### Performance Monitoring
- Monitor model run times and data volumes
- Track incremental model performance
- Alert on data quality issues
- Monitor system resource usage

## Integration with Dataiku

The dbt models are designed to integrate with Dataiku for advanced analytics:

1. **Export to Dataiku**: Use `dbt docs generate` to create data lineage
2. **Connect datasets**: Link fact and dimension tables to Dataiku projects
3. **Advanced analytics**: Build ML models and dashboards on top of dbt outputs

## Support

For issues and questions:
1. Check the dbt logs in the `logs/` directory
2. Review model documentation via `dbt docs serve`
3. Validate data quality with `dbt test`
4. Monitor system health through the performance metrics models

## Version History

- **v1.0.0**: Initial implementation with core analytics models
- **v1.1.0**: Added business KPIs and enhanced performance monitoring
- **v1.2.0**: Integration with Dataiku and advanced user segmentation

## Contributing

When adding new models:
1. Follow the established naming conventions
2. Add appropriate tests for data quality
3. Update this README with new model descriptions
4. Ensure all models pass `dbt test` before deployment