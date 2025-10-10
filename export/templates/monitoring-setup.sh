#!/bin/bash

# Maya Travel Agent - Monitoring Setup Script
# This script sets up comprehensive monitoring infrastructure

set -e

echo "🚀 Setting up Maya Travel Agent monitoring infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROMETHEUS_VERSION="2.40.0"
GRAFANA_VERSION="9.3.0"
ALERTMANAGER_VERSION="0.25.0"
NODE_EXPORTER_VERSION="1.5.0"

# Create monitoring directories
echo -e "${YELLOW}Creating monitoring directories...${NC}"
mkdir -p monitoring/{prometheus,grafana,alertmanager,node-exporter}
mkdir -p monitoring/prometheus/{data,rules}
mkdir -p monitoring/grafana/{data,provisioning/datasources,provisioning/dashboards,dashboards}

# Setup Prometheus configuration
echo -e "${YELLOW}Setting up Prometheus configuration...${NC}"
cat > monitoring/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'maya-backend'
    static_configs:
      - targets: ['maya-backend:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'maya-frontend'
    static_configs:
      - targets: ['maya-frontend:80']
    scrape_interval: 15s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'dataiku'
    static_configs:
      - targets: ['dataiku:8080']
    scrape_interval: 30s
EOF

# Setup Prometheus alerting rules
echo -e "${YELLOW}Setting up Prometheus alerting rules...${NC}"
cat > monitoring/prometheus/rules/maya-alerts.yml << EOF
groups:
  - name: maya-backend
    rules:
      - alert: MayaBackendDown
        expr: up{job="maya-backend"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Maya Backend is down"
          description: "Maya Backend has been down for more than 5 minutes."

      - alert: MayaBackendHighErrorRate
        expr: rate(http_requests_total{job="maya-backend", code=~"5.."}[5m]) / rate(http_requests_total{job="maya-backend"}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on Maya Backend"
          description: "Error rate is {{ \$value }}% which is above 5%."

      - alert: MayaBackendHighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="maya-backend"}[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on Maya Backend"
          description: "95th percentile latency is {{ \$value }}s which is above 2s."

  - name: maya-frontend
    rules:
      - alert: MayaFrontendDown
        expr: up{job="maya-frontend"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Maya Frontend is down"
          description: "Maya Frontend has been down for more than 5 minutes."

  - name: system
    rules:
      - alert: HighCpuUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ \$value }}%."

      - alert: HighMemoryUsage
        expr: (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ \$value }}%."

      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10%."

  - name: ml-models
    rules:
      - alert: MLModelHighLatency
        expr: histogram_quantile(0.95, rate(ml_prediction_duration_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "ML model high latency"
          description: "ML prediction latency is {{ \$value }}s which is above 5s."

      - alert: MLModelLowAccuracy
        expr: ml_model_accuracy < 0.8
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "ML model low accuracy"
          description: "ML model accuracy is {{ \$value }} which is below 80%."
EOF

# Setup Alertmanager configuration
echo -e "${YELLOW}Setting up Alertmanager configuration...${NC}"
cat > monitoring/alertmanager/alertmanager.yml << EOF
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@maya-travel-agent.com'
  smtp_auth_username: 'alerts@maya-travel-agent.com'
  smtp_auth_password: 'your-smtp-password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'maya-team'
  routes:
  - match:
      severity: critical
    receiver: 'maya-critical'

receivers:
- name: 'maya-team'
  email_configs:
  - to: 'team@maya-travel-agent.com'
    send_resolved: true

- name: 'maya-critical'
  email_configs:
  - to: 'oncall@maya-travel-agent.com'
    send_resolved: true
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#alerts-critical'
    send_resolved: true
EOF

# Setup Grafana provisioning
echo -e "${YELLOW}Setting up Grafana provisioning...${NC}"

# Grafana datasource configuration
cat > monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Grafana dashboard provisioning
cat > monitoring/grafana/provisioning/dashboards/maya.yml << EOF
apiVersion: 1

providers:
  - name: 'maya-dashboards'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Copy Maya dashboard to Grafana
cp grafana/maya-dashboard.json monitoring/grafana/dashboards/

# Setup docker-compose for monitoring stack
echo -e "${YELLOW}Creating monitoring docker-compose file...${NC}"
cat > monitoring/docker-compose.monitoring.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v${PROMETHEUS_VERSION}
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:${GRAFANA_VERSION}
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    depends_on:
      - prometheus
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:v${ALERTMANAGER_VERSION}
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:v${NODE_EXPORTER_VERSION}
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
EOF

# Create monitoring startup script
echo -e "${YELLOW}Creating monitoring startup script...${NC}"
cat > monitoring/start-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Maya Travel Agent monitoring stack..."

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

echo "📊 Monitoring services started!"
echo "🌐 Grafana: http://localhost:3000 (admin/admin)"
echo "📈 Prometheus: http://localhost:9090"
echo "🚨 Alertmanager: http://localhost:9093"
echo "📊 Node Exporter: http://localhost:9100"

echo ""
echo "To view logs:"
echo "docker-compose -f docker-compose.monitoring.yml logs -f"
echo ""
echo "To stop monitoring:"
echo "docker-compose -f docker-compose.monitoring.yml down"
EOF

chmod +x monitoring/start-monitoring.sh

# Create monitoring health check script
echo -e "${YELLOW}Creating monitoring health check script...${NC}"
cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking Maya Travel Agent monitoring health..."

# Check Prometheus
if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus: Healthy"
else
    echo "❌ Prometheus: Unhealthy"
fi

# Check Grafana
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Grafana: Healthy"
else
    echo "❌ Grafana: Unhealthy"
fi

# Check Alertmanager
if curl -f http://localhost:9093/-/healthy > /dev/null 2>&1; then
    echo "✅ Alertmanager: Healthy"
else
    echo "❌ Alertmanager: Unhealthy"
fi

# Check Node Exporter
if curl -f http://localhost:9100/metrics > /dev/null 2>&1; then
    echo "✅ Node Exporter: Healthy"
else
    echo "❌ Node Exporter: Unhealthy"
fi

echo ""
echo "📊 Monitoring URLs:"
echo "🌐 Grafana: http://localhost:3000"
echo "📈 Prometheus: http://localhost:9090"
echo "🚨 Alertmanager: http://localhost:9093"
EOF

chmod +x monitoring/health-check.sh

echo -e "${GREEN}✅ Monitoring setup completed!${NC}"
echo ""
echo "📁 Monitoring files created in ./monitoring/"
echo ""
echo "🚀 To start monitoring:"
echo "cd monitoring && ./start-monitoring.sh"
echo ""
echo "🔍 To check health:"
echo "./monitoring/health-check.sh"
echo ""
echo "⚠️  Remember to:"
echo "1. Update SMTP credentials in alertmanager/alertmanager.yml"
echo "2. Configure Slack webhook for critical alerts"
echo "3. Change default Grafana password"
echo "4. Review and customize alerting rules"