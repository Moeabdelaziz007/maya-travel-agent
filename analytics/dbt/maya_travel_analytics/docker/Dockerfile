# Dockerfile for Maya Travel Agent dbt Analytics
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DBT_PROFILES_DIR=/opt/dbt \
    DBT_PROJECT_DIR=/opt/dbt/maya_travel_analytics

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    dbt-core==1.7.0 \
    dbt-postgres==1.7.0 \
    && rm -rf /root/.cache/pip

# Create dbt user
RUN useradd --create-home --shell /bin/bash dbt

# Create necessary directories
RUN mkdir -p /opt/dbt/maya_travel_analytics /opt/dbt/logs
RUN chown -R dbt:dbt /opt/dbt

# Copy project files
COPY --chown=dbt:dbt . /opt/dbt/maya_travel_analytics/

# Set working directory
WORKDIR /opt/dbt/maya_travel_analytics

# Switch to dbt user
USER dbt

# Install dbt dependencies
RUN dbt deps

# Expose port for dbt docs
EXPOSE 8080

# Default command
CMD ["dbt", "--help"]