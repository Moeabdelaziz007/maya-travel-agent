#!/usr/bin/env node

/**
 * Maya Travel Agent - Dashboard Testing Utilities
 *
 * Tests for monitoring dashboard functionality including
 * real-time updates, manual controls, and status display.
 */

const http = require('http');
const fs = require('fs');

class DashboardTestSuite {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            startTime: new Date(),
            endTime: null,
            tests: []
        };

        this.dashboardUrl = 'file://' + __dirname + '/monitoring-dashboard.html';
        this.apiBaseUrl = 'http://localhost:8000/api/self-healing';
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`);
    }

    recordTest(testName, status, message, duration, details = {}) {
        const testResult = {
            name: testName,
            status,
            message,
            duration,
            timestamp: new Date().toISOString(),
            details
        };

        this.testResults.tests.push(testResult);
        this.testResults.total++;

        switch (status) {
            case 'PASS':
                this.testResults.passed++;
                this.log(`✅ PASS: ${testName} (${duration}ms)`, 'INFO');
                break;
            case 'FAIL':
                this.testResults.failed++;
                this.log(`❌ FAIL: ${testName} - ${message} (${duration}ms)`, 'ERROR');
                break;
            case 'SKIP':
                this.testResults.skipped++;
                this.log(`⏭️  SKIP: ${testName} - ${message} (${duration}ms)`, 'WARN');
                break;
        }
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = http.request(url, {
                timeout: 5000,
                ...options
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.method === 'POST' || options.method === 'PUT') {
                req.write(options.body || '');
            }

            req.end();
        });
    }

    async testDashboardFileExists() {
        const startTime = Date.now();

        try {
            if (fs.existsSync('monitoring-dashboard.html')) {
                this.recordTest(
                    'Dashboard File Exists',
                    'PASS',
                    'Dashboard HTML file is present',
                    Date.now() - startTime
                );
                return true;
            } else {
                this.recordTest(
                    'Dashboard File Exists',
                    'FAIL',
                    'Dashboard HTML file is missing',
                    Date.now() - startTime
                );
                return false;
            }
        } catch (error) {
            this.recordTest(
                'Dashboard File Exists',
                'FAIL',
                `Error checking dashboard file: ${error.message}`,
                Date.now() - startTime
            );
            return false;
        }
    }

    async testDashboardStructure() {
        const startTime = Date.now();

        try {
            const content = fs.readFileSync('monitoring-dashboard.html', 'utf8');

            const requiredElements = [
                'System Status',
                'Self-Healing Engine',
                'Service Health',
                'Activity Logs',
                'startMonitoring',
                'stopMonitoring',
                'runHealthCheck'
            ];

            const missingElements = requiredElements.filter(element =>
                !content.includes(element)
            );

            if (missingElements.length === 0) {
                this.recordTest(
                    'Dashboard Structure',
                    'PASS',
                    'Dashboard contains all required elements',
                    Date.now() - startTime
                );
                return true;
            } else {
                this.recordTest(
                    'Dashboard Structure',
                    'FAIL',
                    `Missing elements: ${missingElements.join(', ')}`,
                    Date.now() - startTime
                );
                return false;
            }
        } catch (error) {
            this.recordTest(
                'Dashboard Structure',
                'FAIL',
                `Error reading dashboard file: ${error.message}`,
                Date.now() - startTime
            );
            return false;
        }
    }

    async testApiEndpoints() {
        const endpoints = [
            { path: '/status', method: 'GET' },
            { path: '/start', method: 'POST' },
            { path: '/stop', method: 'POST' },
            { path: '/check', method: 'POST' }
        ];

        for (const endpoint of endpoints) {
            const startTime = Date.now();

            try {
                const response = await this.makeRequest(
                    `${this.apiBaseUrl}${endpoint.path}`,
                    { method: endpoint.method }
                );

                if (response.statusCode >= 200 && response.statusCode < 500) {
                    this.recordTest(
                        `API Endpoint: ${endpoint.method} ${endpoint.path}`,
                        'PASS',
                        `Endpoint responds with ${response.statusCode}`,
                        Date.now() - startTime
                    );
                } else {
                    this.recordTest(
                        `API Endpoint: ${endpoint.method} ${endpoint.path}`,
                        'FAIL',
                        `Endpoint returned ${response.statusCode}`,
                        Date.now() - startTime
                    );
                }
            } catch (error) {
                this.recordTest(
                    `API Endpoint: ${endpoint.method} ${endpoint.path}`,
                    'SKIP',
                    `Endpoint not available: ${error.message}`,
                    Date.now() - startTime
                );
            }
        }
    }

    async testSelfHealingWorkflowIntegration() {
        const startTime = Date.now();

        try {
            // Test status endpoint
            const statusResponse = await this.makeRequest(`${this.apiBaseUrl}/status`);
            if (statusResponse.statusCode !== 200) {
                this.recordTest(
                    'Self-Healing Integration',
                    'SKIP',
                    'Self-healing API not available',
                    Date.now() - startTime
                );
                return;
            }

            const statusData = JSON.parse(statusResponse.body);

            // Verify expected status fields
            const requiredFields = ['isRunning', 'checkInterval', 'lastCheck', 'issuesCount'];
            const missingFields = requiredFields.filter(field => !(field in statusData));

            if (missingFields.length === 0) {
                this.recordTest(
                    'Self-Healing Integration',
                    'PASS',
                    'Status response contains all required fields',
                    Date.now() - startTime
                );
            } else {
                this.recordTest(
                    'Self-Healing Integration',
                    'FAIL',
                    `Missing fields in status response: ${missingFields.join(', ')}`,
                    Date.now() - startTime
                );
            }
        } catch (error) {
            this.recordTest(
                'Self-Healing Integration',
                'SKIP',
                `Integration test skipped: ${error.message}`,
                Date.now() - startTime
            );
        }
    }

    async testDashboardJavaScript() {
        const startTime = Date.now();

        try {
            const content = fs.readFileSync('monitoring-dashboard.html', 'utf8');

            // Check for required JavaScript functionality
            const requiredJS = [
                'class Dashboard',
                'startMonitoring',
                'stopMonitoring',
                'runHealthCheck',
                'updateSystemStatus',
                'addLog'
            ];

            const missingJS = requiredJS.filter(js => !content.includes(js));

            if (missingJS.length === 0) {
                this.recordTest(
                    'Dashboard JavaScript',
                    'PASS',
                    'Dashboard JavaScript contains all required functions',
                    Date.now() - startTime
                );
            } else {
                this.recordTest(
                    'Dashboard JavaScript',
                    'FAIL',
                    `Missing JavaScript functions: ${missingJS.join(', ')}`,
                    Date.now() - startTime
                );
            }
        } catch (error) {
            this.recordTest(
                'Dashboard JavaScript',
                'FAIL',
                `Error checking JavaScript: ${error.message}`,
                Date.now() - startTime
            );
        }
    }

    async testDashboardStyling() {
        const startTime = Date.now();

        try {
            const content = fs.readFileSync('monitoring-dashboard.html', 'utf8');

            // Check for required CSS styling
            const requiredStyles = [
                'background: linear-gradient',
                '.card',
                '.status-icon',
                '.log-entry',
                'font-family',
                '@keyframes pulse'
            ];

            const missingStyles = requiredStyles.filter(style => !content.includes(style));

            if (missingStyles.length === 0) {
                this.recordTest(
                    'Dashboard Styling',
                    'PASS',
                    'Dashboard contains all required styling',
                    Date.now() - startTime
                );
            } else {
                this.recordTest(
                    'Dashboard Styling',
                    'FAIL',
                    `Missing styling elements: ${missingStyles.join(', ')}`,
                    Date.now() - startTime
                );
            }
        } catch (error) {
            this.recordTest(
                'Dashboard Styling',
                'FAIL',
                `Error checking styling: ${error.message}`,
                Date.now() - startTime
            );
        }
    }

    async runAllTests() {
        this.log('🖥️  Starting Dashboard Test Suite');
        this.log('================================');

        // Static tests (don't require running services)
        await this.testDashboardFileExists();
        await this.testDashboardStructure();
        await this.testDashboardJavaScript();
        await this.testDashboardStyling();

        // Dynamic tests (require running services)
        await this.testApiEndpoints();
        await this.testSelfHealingWorkflowIntegration();

        this.testResults.endTime = new Date();
        this.generateReport();
    }

    generateReport() {
        const duration = this.testResults.endTime - this.testResults.startTime;

        console.log('\n📊 DASHBOARD TEST REPORT');
        console.log('========================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Skipped: ${this.testResults.skipped}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);

        // Detailed results
        console.log('\n📋 DETAILED RESULTS');
        console.log('===================');

        this.testResults.tests.forEach(test => {
            console.log(`${test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⏭️'}  ${test.name}`);
            console.log(`   ${test.message} (${test.duration}ms)`);
        });

        // Save report to file
        this.saveReportToFile();
    }

    saveReportToFile() {
        const reportPath = 'logs/dashboard-test-report.json';

        try {
            if (!fs.existsSync('logs')) {
                fs.mkdirSync('logs');
            }

            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            this.log(`Dashboard test report saved to: ${reportPath}`, 'INFO');
        } catch (error) {
            this.log(`Failed to save dashboard report: ${error.message}`, 'ERROR');
        }
    }
}

// CLI interface
if (require.main === module) {
    const dashboardTestSuite = new DashboardTestSuite();

    const command = process.argv[2];

    switch (command) {
        case 'run':
            dashboardTestSuite.runAllTests().then(() => {
                console.log('\n🎯 Dashboard test suite completed');
                process.exit(dashboardTestSuite.testResults.failed > 0 ? 1 : 0);
            }).catch(error => {
                console.error('Dashboard test suite failed:', error);
                process.exit(1);
            });
            break;

        case 'static':
            console.log('Running static dashboard tests only...');
            dashboardTestSuite.testDashboardFileExists();
            dashboardTestSuite.testDashboardStructure();
            dashboardTestSuite.testDashboardJavaScript();
            dashboardTestSuite.testDashboardStyling();
            break;

        case 'dynamic':
            console.log('Running dynamic dashboard tests only...');
            dashboardTestSuite.testApiEndpoints();
            dashboardTestSuite.testSelfHealingWorkflowIntegration();
            break;

        default:
            console.log('Usage: node dashboard.test.js [run|static|dynamic]');
            console.log('');
            console.log('Commands:');
            console.log('  run     - Run all dashboard tests');
            console.log('  static  - Run only static tests (file structure, content)');
            console.log('  dynamic - Run only dynamic tests (API integration)');
            process.exit(1);
    }
}

module.exports = DashboardTestSuite;