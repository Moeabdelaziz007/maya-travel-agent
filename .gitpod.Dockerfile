# Gitpod Dockerfile for Maya Travel Agent
# Optimized for Node.js development with minimal overhead

FROM gitpod/workspace-full:latest

# Install Node.js 18 (LTS) if not already available
RUN bash -c ". .nvm/nvm.sh && nvm install 18 && nvm use 18 && nvm alias default 18"

# Set Node.js 18 as default
RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

# Install global npm packages for development
RUN npm install -g \
    nodemon \
    npm-check-updates \
    serve

# Install PostgreSQL client for Supabase
RUN sudo apt-get update && \
    sudo apt-get install -y postgresql-client && \
    sudo rm -rf /var/lib/apt/lists/*

# Set environment variables for better performance
ENV NODE_ENV=development
ENV NPM_CONFIG_LOGLEVEL=warn

# Configure Git
RUN git config --global init.defaultBranch main

# Create workspace directory
RUN mkdir -p /workspace/maya-travel-agent

# Set working directory
WORKDIR /workspace/maya-travel-agent

# Optimize VS Code Server performance
ENV VSCODE_DISABLE_WORKSPACE_TRUST=true

