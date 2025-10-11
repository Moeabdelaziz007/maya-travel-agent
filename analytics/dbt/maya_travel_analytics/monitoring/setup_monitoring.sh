#!/bin/bash

# Amrikyy Travel Agent dbt Analytics Monitoring Setup
# This script sets up monitoring and alerting for the analytics pipeline

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
ALERTS_FILE="$PROJECT_DIR/alerts.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Success message
success() {
    echo -e "${GREEN}$1${NC}"
}

# Warning message
warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Error message
error() {
    echo -e "${RED}Error: $1${NC}"
}

# Create log directory
setup_log_directory() {
    log "Setting up log directory..."
    mkdir -p "$LOG_DIR"
    success "Log directory created at $LOG_DIR"
}

# Create alerts configuration
create_alerts_config() {
    log "Creating alerts configuration..."

    cat > "$ALERTS_FILE" << 'EOF'
# Amrikyy Travel Agent Analytics Alerts Configuration

global:
  smtp_smtp:
    host: 'your_smtp_host'
    port: 587
    username: 'your_email@domain.com'
    password: 'your_app_password'

# Alert Rules
groups:
  - name: amrikyy_analytics.alerts
    interval: 60s
    rules:

    # dbt Model Failures
    - alert: DbtModelFailure
      expr: up{job="amrikyy_dbt"} == 0
      for: 5m
      labels:
        severity: critical
        service: analytics
      annotations:
        summary: "dbt models are failing"
        description: "dbt model execution has failed for more than 5 minutes"

    # Data Quality Issues
    - alert: DataQualityIssues
      expr: increase(dbt_test_failures_total[1h]) > 0
      for: 1m
      labels:
        severity: warning
        service: analytics
      annotations:
        summary: "Data quality tests are failing"
        description: "One or more dbt data quality tests have failed"

    # High Error Rate
    - alert: HighErrorRate
      expr: increase(error_rate_percentage[15m]) > 20
      for: 10m
      labels:
        severity: warning
        service: analytics
      annotations:
        summary: "High error rate detected"
        description: "Error rate has exceeded 20% for more than 10 minutes"

    # Slow Response Times
    - alert: SlowResponseTimes
      expr: avg_response_time_ms > 10000
      for: 15m
      labels:
        severity: warning
        service: analytics
      annotations:
        summary: "Slow response times detected"
        description: "Average response time has exceeded 10 seconds for more than 15 minutes"

    # Revenue Drop
    - alert: RevenueDrop
      expr: |
        (rate(monthly_revenue[1h]) / rate(monthly_revenue[24h] offset 1h)) < 0.8
      for: 2h
      labels:
        severity: warning
        service: business
      annotations:
        summary: "Significant revenue drop detected"
        description: "Revenue has dropped by more than 20% compared to the same time yesterday"

    # User Engagement Drop
    - alert: UserEngagementDrop
      expr: avg_engagement_score < 30
      for: 1h
      labels:
        severity: info
        service: analytics
      annotations:
        summary: "User engagement has dropped"
        description: "Average user engagement score is below 30 for more than 1 hour"
EOF

    success "Alerts configuration created at $ALERTS_FILE"
}

# Create monitoring dashboard configuration
create_dashboard_config() {
    log "Creating monitoring dashboard configuration..."

    DASHBOARD_FILE="$PROJECT_DIR/monitoring/dashboard.json"

    cat > "$DASHBOARD_FILE" << 'EOF'
{
  "dashboard": {
    "title": "Amrikyy Travel Agent Analytics",
    "tags": ["amrikyy", "analytics", "dbt"],
    "timezone": "browser",
    "panels": [
      {
        "title": "dbt Model Run Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"amrikyy_dbt\"}",
            "legendFormat": "Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "red",
                  "value": 0
                },
                {
                  "color": "green",
                  "value": 1
                }
              ]
            }
          }
        }
      },
      {
        "title": "Data Quality Test Results",
        "type": "bargauge",
        "targets": [
          {
            "expr": "dbt_test_success_total",
            "legendFormat": "Passed"
          },
          {
            "expr": "dbt_test_failures_total",
            "legendFormat": "Failed"
          }
        ]
      },
      {
        "title": "Response Time Trends",
        "type": "graph",
        "targets": [
          {
            "expr": "avg_response_time_ms",
            "legendFormat": "Avg Response Time (ms)"
          },
          {
            "expr": "median_response_time_ms",
            "legendFormat": "Median Response Time (ms)"
          }
        ],
        "yAxes": [
          {
            "label": "Response Time (ms)",
            "min": 0
          }
        ]
      },
      {
        "title": "User Engagement Score",
        "type": "graph",
        "targets": [
          {
            "expr": "avg_engagement_score",
            "legendFormat": "Average Engagement Score"
          }
        ],
        "yAxes": [
          {
            "label": "Engagement Score",
            "min": 0,
            "max": 100
          }
        ]
      },
      {
        "title": "Monthly Revenue",
        "type": "graph",
        "targets": [
          {
            "expr": "monthly_revenue",
            "legendFormat": "Monthly Revenue"
          }
        ],
        "yAxes": [
          {
            "label": "Revenue ($)",
            "min": 0
          }
        ]
      },
      {
        "title": "Conversion Funnel",
        "type": "funnel",
        "targets": [
          {
            "expr": "conversion_rate_percentage",
            "legendFormat": "{{ funnel_stage }}"
          }
        ]
      }
    ],
    "time": {
      "from": "now-24h",
      "to": "now"
    },
    "refresh": "5m"
  }
}
EOF

    success "Dashboard configuration created at $DASHBOARD_FILE"
}

# Create Prometheus metrics exporter script
create_metrics_exporter() {
    log "Creating metrics exporter script..."

    METRICS_SCRIPT="$PROJECT_DIR/monitoring/export_metrics.py"

    cat > "$METRICS_SCRIPT" << 'EOF'
#!/usr/bin/env python3
"""
Prometheus Metrics Exporter for Amrikyy Travel Agent Analytics
Exports dbt model metrics and business KPIs to Prometheus format
"""

import os
import psycopg2
import time
from datetime import datetime
from prometheus_client import start_http_server, Gauge, Counter, Histogram

# Database connection
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', 5432)
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

# Prometheus metrics
DBT_RUN_DURATION = Histogram('dbt_run_duration_seconds', 'Duration of dbt model runs')
DBT_TEST_RESULTS = Counter('dbt_test_results_total', 'Results of dbt tests', ['status'])
USER_ENGAGEMENT_SCORE = Gauge('user_engagement_score', 'Average user engagement score')
MONTHLY_REVENUE = Gauge('monthly_revenue', 'Monthly revenue in USD')
CONVERSION_RATE = Gauge('conversion_rate_percentage', 'Trip conversion rate percentage')
RESPONSE_TIME_AVG = Gauge('response_time_avg_ms', 'Average response time in milliseconds')
ERROR_RATE = Gauge('error_rate_percentage', 'Error rate percentage')

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

def export_user_engagement_metrics():
    """Export user engagement metrics"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT AVG(avg_engagement_score)
                    FROM analytics.dim_user_engagement
                    WHERE has_session_data = true
                """)
                result = cur.fetchone()
                if result and result[0]:
                    USER_ENGAGEMENT_SCORE.set(result[0])
    except Exception as e:
        print(f"Error exporting user engagement metrics: {e}")

def export_business_metrics():
    """Export business KPI metrics"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Monthly revenue
                cur.execute("""
                    SELECT monthly_revenue
                    FROM analytics.dim_business_kpis
                    ORDER BY kpi_month DESC
                    LIMIT 1
                """)
                result = cur.fetchone()
                if result and result[0]:
                    MONTHLY_REVENUE.set(result[0])

                # Conversion rate
                cur.execute("""
                    SELECT AVG(conversion_rate_percentage)
                    FROM analytics.dim_conversion_funnel
                    WHERE has_data = true
                """)
                result = cur.fetchone()
                if result and result[0]:
                    CONVERSION_RATE.set(result[0])

    except Exception as e:
        print(f"Error exporting business metrics: {e}")

def export_performance_metrics():
    """Export system performance metrics"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Average response time
                cur.execute("""
                    SELECT AVG(avg_response_time_ms)
                    FROM analytics.fact_system_performance
                    WHERE has_response_metrics = true
                """)
                result = cur.fetchone()
                if result and result[0]:
                    RESPONSE_TIME_AVG.set(result[0])

                # Error rate
                cur.execute("""
                    SELECT AVG(error_rate_percentage)
                    FROM analytics.fact_system_performance
                    WHERE has_conversation_data = true
                """)
                result = cur.fetchone()
                if result and result[0]:
                    ERROR_RATE.set(result[0])

    except Exception as e:
        print(f"Error exporting performance metrics: {e}")

def main():
    """Main metrics export loop"""
    # Start HTTP server for Prometheus
    start_http_server(8000)
    print("Metrics server started on port 8000")

    while True:
        try:
            export_user_engagement_metrics()
            export_business_metrics()
            export_performance_metrics()
            print(f"Metrics exported at {datetime.now()}")
        except Exception as e:
            print(f"Error in metrics export: {e}")

        time.sleep(60)  # Export every minute

if __name__ == "__main__":
    main()
EOF

    chmod +x "$METRICS_SCRIPT"
    success "Metrics exporter script created at $METRICS_SCRIPT"
}

# Create log rotation configuration
create_log_rotation() {
    log "Creating log rotation configuration..."

    LOGROTATE_FILE="/etc/logrotate.d/amrikyy_analytics"

    # Check if running as root (needed for system-wide logrotate)
    if [[ $EUID -eq 0 ]]; then
        cat > "$LOGROTATE_FILE" << 'EOF'
/opt/dbt/amrikyy_travel_analytics/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 dbt dbt
    postrotate
        # Signal dbt to reopen log files if needed
        kill -HUP $(pgrep -f "amrikyy_travel_analytics") 2>/dev/null || true
    endscript
}
EOF
        success "System logrotate configuration created"
    else
        warning "Not running as root - skipping system logrotate configuration"
        warning "Manual log rotation can be set up using the provided script"
    fi
}

# Create monitoring startup script
create_startup_script() {
    log "Creating monitoring startup script..."

    STARTUP_SCRIPT="$PROJECT_DIR/monitoring/start_monitoring.sh"

    cat > "$STARTUP_SCRIPT" << 'EOF'
#!/bin/bash

# Amrikyy Travel Agent Analytics Monitoring Startup Script

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
METRICS_SCRIPT="$PROJECT_DIR/monitoring/export_metrics.py"

echo "Starting Amrikyy Travel Agent Analytics monitoring..."

# Check if Python virtual environment exists
if [[ -d "$PROJECT_DIR/venv" ]]; then
    source "$PROJECT_DIR/venv/bin/activate"
fi

# Install required Python packages
pip install prometheus_client psycopg2-binary

# Start metrics exporter in background
echo "Starting Prometheus metrics exporter..."
python3 "$METRICS_SCRIPT" &

echo "Monitoring started successfully!"
echo "Metrics available at: http://localhost:8000/metrics"
echo "View logs at: $PROJECT_DIR/logs/"
EOF

    chmod +x "$STARTUP_SCRIPT"
    success "Monitoring startup script created at $STARTUP_SCRIPT"
}

# Main setup function
main() {
    log "Setting up Amrikyy Travel Agent Analytics monitoring..."

    setup_log_directory
    create_alerts_config
    create_dashboard_config
    create_metrics_exporter
    create_log_rotation
    create_startup_script

    success "Monitoring setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure SMTP settings in $ALERTS_FILE"
    echo "2. Start monitoring: $PROJECT_DIR/monitoring/start_monitoring.sh"
    echo "3. Set up Prometheus to scrape metrics from localhost:8000"
    echo "4. Configure Grafana to use the dashboard at $PROJECT_DIR/monitoring/dashboard.json"
    echo "5. Set up alerting based on $ALERTS_FILE"
}

# Run main function
main