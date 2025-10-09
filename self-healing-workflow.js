#!/usr/bin/env node

/**
 * Maya Travel Agent - Self-Healing Workflow System
 *
 * This system continuously monitors, diagnoses, and fixes issues
 * in the development environment and application stack.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

class SelfHealingWorkflow {
    constructor() {
        this.config = {
            checkInterval: 30000, // 30 seconds
            maxRetries: 3,
            logFile: 'logs/self-healing.log',
            services: {
                frontend: { port: 3000, url: 'http://localhost:3000' },
                backend: { port: 8000, url: 'http://localhost:8000' },
                ai_tools: { port: 8080, url: 'http://localhost:8080' }
            }
        };

        this.issues = [];
        this.isRunning = false;
        this.monitoringInterval = null;

        this.setupLogging();
        this.loadKnowledgeBase();
    }

    setupLogging() {
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }
    }

    loadKnowledgeBase() {
        // Load known issues and solutions from knowledge base
        this.knowledgeBase = {
            'frontend_build_failed': {
                symptoms: ['npm install failed', 'build error', 'dependency conflict'],
                diagnosis: 'Frontend dependency or build issue',
                solutions: [
                    'Clear npm cache and reinstall',
                    'Check Node.js version compatibility',
                    'Update package.json dependencies'
                ]
            },
            'backend_server_down': {
                symptoms: ['Connection refused', 'Server not responding', 'Port not accessible'],
                diagnosis: 'Backend server is not running or unreachable',
                solutions: [
                    'Restart backend server',
                    'Check Python environment',
                    'Verify port availability'
                ]
            },
            'database_connection_failed': {
                symptoms: ['Connection timeout', 'Authentication failed', 'Database not accessible'],
                diagnosis: 'Database connectivity issue',
                solutions: [
                    'Check database credentials',
                    'Verify database server status',
                    'Test network connectivity'
                ]
            }
        };
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;

        console.log(logEntry.trim());
        fs.appendFileSync(this.config.logFile, logEntry);
    }

    async checkServiceHealth(serviceName, serviceConfig) {
        return new Promise((resolve) => {
            const req = http.request(serviceConfig.url + '/health', {
                timeout: 5000,
                method: 'GET'
            }, (res) => {
                resolve(res.statusCode < 400);
            });

            req.on('error', () => {
                resolve(false);
            });

            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    async checkSystemHealth() {
        const issues = [];

        // Check if required files exist
        const requiredFiles = [
            'frontend/package.json',
            'backend/requirements.txt',
            'frontend/.env',
            'backend/.env'
        ];

        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                issues.push({
                    type: 'missing_file',
                    severity: 'high',
                    component: path.dirname(file),
                    description: `Required file missing: ${file}`,
                    solution: `Create ${file} or run setup script`
                });
            }
        }

        // Check service health
        for (const [serviceName, serviceConfig] of Object.entries(this.config.services)) {
            const isHealthy = await this.checkServiceHealth(serviceName, serviceConfig);
            if (!isHealthy) {
                issues.push({
                    type: 'service_down',
                    severity: 'critical',
                    component: serviceName,
                    description: `${serviceName} service is not responding`,
                    solution: `Restart ${serviceName} service`
                });
            }
        }

        // Check for common error patterns in logs
        this.scanLogsForErrors(issues);

        return issues;
    }

    scanLogsForErrors(issues) {
        const logFiles = [
            'logs/frontend.log',
            'logs/backend.log',
            'logs/self-healing.log'
        ];

        for (const logFile of logFiles) {
            if (fs.existsSync(logFile)) {
                try {
                    const content = fs.readFileSync(logFile, 'utf8');
                    const recentContent = content.slice(-1000); // Last 1000 chars

                    // Look for error patterns
                    const errorPatterns = [
                        { pattern: /error:/i, type: 'generic_error' },
                        { pattern: /failed to/i, type: 'operation_failed' },
                        { pattern: /exception/i, type: 'exception' },
                        { pattern: /timeout/i, type: 'timeout' },
                        { pattern: /connection refused/i, type: 'connection_refused' }
                    ];

                    for (const { pattern, type } of errorPatterns) {
                        if (pattern.test(recentContent)) {
                            issues.push({
                                type: 'log_error',
                                severity: 'medium',
                                component: 'logs',
                                description: `Error pattern found in ${logFile}: ${type}`,
                                solution: 'Review log file for details'
                            });
                        }
                    }
                } catch (error) {
                    this.log(`Failed to scan log file ${logFile}: ${error.message}`, 'ERROR');
                }
            }
        }
    }

    diagnoseIssue(issue) {
        // Match issue against knowledge base
        for (const [issueType, knowledge] of Object.entries(this.knowledgeBase)) {
            if (issue.type === issueType ||
                knowledge.symptoms.some(symptom =>
                    issue.description.toLowerCase().includes(symptom.toLowerCase())
                )) {
                return {
                    ...issue,
                    diagnosis: knowledge.diagnosis,
                    possibleSolutions: knowledge.solutions,
                    confidence: 0.8
                };
            }
        }

        // Generic diagnosis for unknown issues
        return {
            ...issue,
            diagnosis: 'Unknown issue detected',
            possibleSolutions: ['Manual investigation required', 'Check system resources', 'Review recent changes'],
            confidence: 0.3
        };
    }

    async applyFix(issue, solution) {
        this.log(`Applying fix for ${issue.component}: ${solution}`, 'INFO');

        try {
            switch (solution) {
                case 'Clear npm cache and reinstall':
                    execSync('cd frontend && npm cache clean --force && npm install', { stdio: 'inherit' });
                    break;

                case 'Restart backend server':
                    execSync('pkill -f "python app.py" || true', { stdio: 'inherit' });
                    execSync('./start-backend.sh', { stdio: 'inherit' });
                    break;

                case 'Restart frontend service':
                    execSync('pkill -f "npm run dev" || true', { stdio: 'inherit' });
                    execSync('./start-frontend.sh', { stdio: 'inherit' });
                    break;

                case 'Check Node.js version compatibility':
                    const nodeVersion = execSync('node --version').toString().trim();
                    this.log(`Node.js version: ${nodeVersion}`, 'INFO');
                    break;

                case 'Check Python environment':
                    const pythonVersion = execSync('python3 --version').toString().trim();
                    this.log(`Python version: ${pythonVersion}`, 'INFO');
                    break;

                default:
                    this.log(`Unknown solution: ${solution}`, 'WARN');
                    return false;
            }

            this.log(`Successfully applied fix: ${solution}`, 'INFO');
            return true;

        } catch (error) {
            this.log(`Failed to apply fix ${solution}: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async healingCycle() {
        this.log('Starting health check cycle...', 'INFO');

        try {
            // Check system health
            const issues = await this.checkSystemHealth();

            if (issues.length === 0) {
                this.log('All systems healthy ✓', 'INFO');
                return;
            }

            // Process each issue
            for (const issue of issues) {
                this.log(`Issue detected: ${issue.description}`, 'WARN');

                // Diagnose the issue
                const diagnosis = this.diagnoseIssue(issue);
                this.log(`Diagnosis: ${diagnosis.diagnosis} (confidence: ${Math.round(diagnosis.confidence * 100)}%)`, 'INFO');

                // Try to fix the issue
                let fixApplied = false;
                for (const solution of diagnosis.possibleSolutions) {
                    if (await this.applyFix(issue, solution)) {
                        fixApplied = true;
                        this.log(`Applied solution: ${solution}`, 'INFO');
                        break;
                    }
                }

                if (!fixApplied) {
                    this.log(`Could not automatically fix issue: ${issue.description}`, 'ERROR');
                    this.log(`Manual intervention required for: ${issue.component}`, 'WARN');
                }
            }

        } catch (error) {
            this.log(`Error in healing cycle: ${error.message}`, 'ERROR');
        }
    }

    start() {
        if (this.isRunning) {
            this.log('Self-healing workflow is already running', 'WARN');
            return;
        }

        this.isRunning = true;
        this.log('Starting self-healing workflow...', 'INFO');

        // Run initial health check
        this.healingCycle();

        // Set up periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.healingCycle();
        }, this.config.checkInterval);

        this.log(`Self-healing workflow started with ${this.config.checkInterval}ms interval`, 'INFO');
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.log('Self-healing workflow stopped', 'INFO');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            checkInterval: this.config.checkInterval,
            lastCheck: new Date().toISOString(),
            issuesCount: this.issues.length,
            logFile: this.config.logFile
        };
    }
}

// CLI interface
if (require.main === module) {
    const workflow = new SelfHealingWorkflow();

    process.on('SIGINT', () => {
        console.log('\nReceived SIGINT. Stopping self-healing workflow...');
        workflow.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\nReceived SIGTERM. Stopping self-healing workflow...');
        workflow.stop();
        process.exit(0);
    });

    // Parse command line arguments
    const command = process.argv[2];

    switch (command) {
        case 'start':
            workflow.start();
            break;
        case 'stop':
            workflow.stop();
            break;
        case 'status':
            console.log(JSON.stringify(workflow.getStatus(), null, 2));
            break;
        case 'check':
            workflow.healingCycle().then(() => process.exit(0));
            break;
        default:
            console.log('Usage: node self-healing-workflow.js [start|stop|status|check]');
            console.log('');
            console.log('Commands:');
            console.log('  start  - Start continuous monitoring');
            console.log('  stop   - Stop monitoring');
            console.log('  status - Show current status');
            console.log('  check  - Run one-time health check');
            process.exit(1);
    }
}

module.exports = SelfHealingWorkflow;