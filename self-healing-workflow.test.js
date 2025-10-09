#!/usr/bin/env node

/**
 * Maya Travel Agent - Self-Healing Workflow Test Suite
 *
 * Comprehensive testing framework for validating the self-healing
 * workflow system's ability to detect, diagnose, and fix common
 * development environment issues.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

class SelfHealingTestSuite {
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

        this.testScenarios = {
            // Service failure scenarios
            service_crashes: [
                {
                    name: 'Frontend Server Crash',
                    description: 'Simulate frontend development server crash',
                    setup: this.simulateFrontendCrash.bind(this),
                    verify: this.verifyServiceDown.bind(this),
                    expectedFix: 'Restart frontend service',
                    timeout: 10000
                },
                {
                    name: 'Backend Server Crash',
                    description: 'Simulate backend API server crash',
                    setup: this.simulateBackendCrash.bind(this),
                    verify: this.verifyServiceDown.bind(this),
                    expectedFix: 'Restart backend server',
                    timeout: 10000
                }
            ],

            // Dependency failure scenarios
            dependency_issues: [
                {
                    name: 'Missing Frontend Dependencies',
                    description: 'Remove node_modules to simulate dependency loss',
                    setup: this.simulateMissingFrontendDeps.bind(this),
                    verify: this.verifyMissingDependencies.bind(this),
                    expectedFix: 'Clear npm cache and reinstall',
                    timeout: 15000
                },
                {
                    name: 'Corrupted Package Lock',
                    description: 'Corrupt package-lock.json file',
                    setup: this.simulateCorruptedPackageLock.bind(this),
                    verify: this.verifyCorruptedDependencies.bind(this),
                    expectedFix: 'Clear npm cache and reinstall',
                    timeout: 12000
                }
            ],

            // File system issues
            file_issues: [
                {
                    name: 'Missing Environment Files',
                    description: 'Remove critical .env files',
                    setup: this.simulateMissingEnvFiles.bind(this),
                    verify: this.verifyMissingEnvFiles.bind(this),
                    expectedFix: 'Create missing .env files',
                    timeout: 5000
                },
                {
                    name: 'Missing Requirements File',
                    description: 'Temporarily move requirements.txt',
                    setup: this.simulateMissingRequirements.bind(this),
                    verify: this.verifyMissingRequirements.bind(this),
                    expectedFix: 'Restore requirements.txt',
                    timeout: 5000
                }
            ],

            // Resource exhaustion scenarios
            resource_issues: [
                {
                    name: 'Port Conflict',
                    description: 'Occupy required ports to simulate conflicts',
                    setup: this.simulatePortConflict.bind(this),
                    verify: this.verifyPortConflict.bind(this),
                    expectedFix: 'Check port availability',
                    timeout: 8000
                }
            ]
        };

        this.originalFiles = new Map();
        this.testProcesses = new Set();
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

    // Test scenario setup methods
    async simulateFrontendCrash() {
        this.log('Simulating frontend server crash...');

        try {
            // Kill any existing frontend processes
            execSync('pkill -f "npm run dev" || true', { stdio: 'inherit' });

            // Wait a moment to ensure it's down
            await this.sleep(1000);

            return true;
        } catch (error) {
            this.log(`Failed to simulate frontend crash: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async simulateBackendCrash() {
        this.log('Simulating backend server crash...');

        try {
            // Kill any existing backend processes
            execSync('pkill -f "python app.py" || true', { stdio: 'inherit' });

            // Wait a moment to ensure it's down
            await this.sleep(1000);

            return true;
        } catch (error) {
            this.log(`Failed to simulate backend crash: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async simulateMissingFrontendDeps() {
        this.log('Simulating missing frontend dependencies...');

        const nodeModulesPath = 'frontend/node_modules';
        const packageLockPath = 'frontend/package-lock.json';

        try {
            // Backup existing files
            if (fs.existsSync(nodeModulesPath)) {
                this.originalFiles.set(nodeModulesPath, true);
                execSync(`mv ${nodeModulesPath} ${nodeModulesPath}.backup`);
            }

            if (fs.existsSync(packageLockPath)) {
                this.originalFiles.set(packageLockPath, true);
                execSync(`mv ${packageLockPath} ${packageLockPath}.backup`);
            }

            return true;
        } catch (error) {
            this.log(`Failed to simulate missing dependencies: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async simulateCorruptedPackageLock() {
        this.log('Simulating corrupted package-lock.json...');

        const packageLockPath = 'frontend/package-lock.json';

        try {
            if (fs.existsSync(packageLockPath)) {
                this.originalFiles.set(packageLockPath, fs.readFileSync(packageLockPath));
                // Corrupt the file by writing invalid JSON
                fs.writeFileSync(packageLockPath, '{ invalid json content }');
            }
            return true;
        } catch (error) {
            this.log(`Failed to simulate corrupted package-lock: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async simulateMissingEnvFiles() {
        this.log('Simulating missing environment files...');

        const envFiles = ['frontend/.env', 'backend/.env'];

        try {
            for (const envFile of envFiles) {
                if (fs.existsSync(envFile)) {
                    this.originalFiles.set(envFile, fs.readFileSync(envFile));
                    execSync(`mv ${envFile} ${envFile}.backup`);
                }
            }
            return true;
        } catch (error) {
            this.log(`Failed to simulate missing env files: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async simulateMissingRequirements() {
        this.log('Simulating missing requirements.txt...');

        const requirementsPath = 'backend/requirements.txt';

        try {
            if (fs.existsSync(requirementsPath)) {
                this.originalFiles.set(requirementsPath, true);
                execSync(`mv ${requirementsPath} ${requirementsPath}.backup`);
            }
            return true;
        } catch (error) {
            this.log(`Failed to simulate missing requirements: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async simulatePortConflict() {
        this.log('Simulating port conflicts...');

        try {
            // Start dummy processes on required ports
            const dummyScript = `
                const http = require('http');
                const server = http.createServer((req, res) => {
                    res.writeHead(200);
                    res.end('dummy');
                });
                server.listen(3000);
                server.listen(8000);
            `;

            fs.writeFileSync('dummy-server.js', dummyScript);

            const dummyProcess = spawn('node', ['dummy-server.js'], {
                detached: true,
                stdio: 'ignore'
            });

            this.testProcesses.add(dummyProcess.pid);
            dummyProcess.unref();

            await this.sleep(1000);
            return true;
        } catch (error) {
            this.log(`Failed to simulate port conflict: ${error.message}`, 'ERROR');
            return false;
        }
    }

    // Verification methods
    async verifyServiceDown() {
        const services = [
            { name: 'frontend', port: 3000 },
            { name: 'backend', port: 8000 }
        ];

        for (const service of services) {
            try {
                await this.checkPortAvailability(service.port);
                return false; // Port is available, service is down
            } catch (error) {
                // Port is in use, service might be running
            }
        }

        return true; // All services appear down
    }

    async verifyMissingDependencies() {
        const nodeModulesPath = 'frontend/node_modules';
        const packageLockPath = 'frontend/package-lock.json';

        return !fs.existsSync(nodeModulesPath) || !fs.existsSync(packageLockPath);
    }

    async verifyCorruptedDependencies() {
        const packageLockPath = 'frontend/package-lock.json';

        if (!fs.existsSync(packageLockPath)) {
            return false;
        }

        try {
            JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
            return false; // Valid JSON, not corrupted
        } catch (error) {
            return true; // Invalid JSON, corrupted
        }
    }

    async verifyMissingEnvFiles() {
        return !fs.existsSync('frontend/.env') || !fs.existsSync('backend/.env');
    }

    async verifyMissingRequirements() {
        return !fs.existsSync('backend/requirements.txt');
    }

    async verifyPortConflict() {
        try {
            await this.checkPortAvailability(3000);
            await this.checkPortAvailability(8000);
            return false; // Ports are available, no conflict
        } catch (error) {
            return true; // Ports are in use, conflict exists
        }
    }

    async checkPortAvailability(port) {
        return new Promise((resolve, reject) => {
            const server = http.createServer();
            server.listen(port, () => {
                server.close();
                reject(new Error(`Port ${port} is in use`));
            });
            server.on('error', () => {
                resolve(); // Port is available
            });
        });
    }

    // Test execution
    async runTest(testConfig) {
        const startTime = Date.now();

        this.log(`Running test: ${testConfig.name}`);
        this.log(`Description: ${testConfig.description}`);

        try {
            // Setup phase
            const setupSuccess = await testConfig.setup();
            if (!setupSuccess) {
                this.recordTest(testConfig.name, 'FAIL', 'Setup phase failed', Date.now() - startTime);
                return;
            }

            // Wait for condition to stabilize
            await this.sleep(2000);

            // Verification phase
            const conditionMet = await testConfig.verify();
            if (!conditionMet) {
                this.recordTest(testConfig.name, 'FAIL', 'Test condition not met after setup', Date.now() - startTime);
                return;
            }

            // Wait for self-healing to detect and fix
            await this.sleep(testConfig.timeout);

            // Verify fix was applied
            const fixApplied = await this.verifyFixApplied(testConfig);
            if (fixApplied) {
                this.recordTest(testConfig.name, 'PASS', 'Self-healing successfully applied fix', Date.now() - startTime, {
                    expectedFix: testConfig.expectedFix,
                    actualFix: 'Automated fix applied'
                });
            } else {
                this.recordTest(testConfig.name, 'FAIL', 'Self-healing did not apply fix', Date.now() - startTime, {
                    expectedFix: testConfig.expectedFix
                });
            }

        } catch (error) {
            this.recordTest(testConfig.name, 'FAIL', `Test execution error: ${error.message}`, Date.now() - startTime);
        }
    }

    async verifyFixApplied(testConfig) {
        // Check if the original problem condition is resolved
        return !await testConfig.verify();
    }

    async runAllTests() {
        this.log('🚀 Starting Self-Healing Workflow Test Suite');
        this.log('============================================');

        // Run service crash tests
        for (const test of this.testScenarios.service_crashes) {
            await this.runTest(test);
            await this.cleanup();
        }

        // Run dependency tests
        for (const test of this.testScenarios.dependency_issues) {
            await this.runTest(test);
            await this.restoreOriginalFiles();
        }

        // Run file system tests
        for (const test of this.testScenarios.file_issues) {
            await this.runTest(test);
            await this.restoreOriginalFiles();
        }

        // Run resource tests
        for (const test of this.testScenarios.resource_issues) {
            await this.runTest(test);
            await this.cleanup();
        }

        this.testResults.endTime = new Date();
        this.generateReport();
    }

    async cleanup() {
        this.log('Cleaning up test environment...');

        try {
            // Kill test processes
            this.testProcesses.forEach(pid => {
                try {
                    process.kill(pid, 'SIGTERM');
                } catch (error) {
                    // Process might already be dead
                }
            });
            this.testProcesses.clear();

            // Clean up dummy files
            if (fs.existsSync('dummy-server.js')) {
                fs.unlinkSync('dummy-server.js');
            }

            // Kill any remaining test processes
            execSync('pkill -f "dummy-server.js" || true', { stdio: 'inherit' });

            await this.sleep(1000);
        } catch (error) {
            this.log(`Cleanup error: ${error.message}`, 'WARN');
        }
    }

    async restoreOriginalFiles() {
        this.log('Restoring original files...');

        try {
            // Restore backed up files
            this.originalFiles.forEach((content, filePath) => {
                if (content === true) {
                    // Directory backup
                    const backupPath = `${filePath}.backup`;
                    if (fs.existsSync(backupPath)) {
                        execSync(`mv ${backupPath} ${filePath}`);
                    }
                } else {
                    // File content backup
                    const backupPath = `${filePath}.backup`;
                    if (fs.existsSync(backupPath)) {
                        fs.writeFileSync(filePath, content);
                        execSync(`rm ${backupPath}`);
                    }
                }
            });

            this.originalFiles.clear();
        } catch (error) {
            this.log(`Failed to restore files: ${error.message}`, 'WARN');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateReport() {
        const duration = this.testResults.endTime - this.testResults.startTime;

        console.log('\n📊 SELF-HEALING WORKFLOW TEST REPORT');
        console.log('=====================================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Skipped: ${this.testResults.skipped}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);

        // Detailed results
        console.log('\n📋 DETAILED RESULTS');
        console.log('===================');

        const sortedTests = this.testResults.tests.sort((a, b) => {
            if (a.status === 'FAIL' && b.status !== 'FAIL') return -1;
            if (a.status !== 'FAIL' && b.status === 'FAIL') return 1;
            return a.name.localeCompare(b.name);
        });

        sortedTests.forEach(test => {
            console.log(`${test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⏭️'}  ${test.name}`);
            console.log(`   ${test.message} (${test.duration}ms)`);
            if (test.details.expectedFix) {
                console.log(`   Expected: ${test.details.expectedFix}`);
            }
        });

        // Summary by category
        this.generateCategorySummary();

        // Save report to file
        this.saveReportToFile();
    }

    generateCategorySummary() {
        console.log('\n📈 CATEGORY SUMMARY');
        console.log('===================');

        const categories = {};

        this.testResults.tests.forEach(test => {
            const category = test.name.includes('Frontend') || test.name.includes('Backend') ?
                'Service Management' :
                test.name.includes('Dependencies') || test.name.includes('Package') ?
                'Dependency Management' :
                test.name.includes('Environment') || test.name.includes('Requirements') ?
                'Configuration Management' :
                'Resource Management';

            if (!categories[category]) {
                categories[category] = { total: 0, passed: 0, failed: 0 };
            }

            categories[category].total++;
            if (test.status === 'PASS') categories[category].passed++;
            if (test.status === 'FAIL') categories[category].failed++;
        });

        Object.entries(categories).forEach(([category, stats]) => {
            const successRate = Math.round((stats.passed / stats.total) * 100);
            console.log(`${category}: ${stats.passed}/${stats.total} passed (${successRate}%)`);
        });
    }

    saveReportToFile() {
        const reportPath = 'logs/self-healing-test-report.json';

        try {
            if (!fs.existsSync('logs')) {
                fs.mkdirSync('logs');
            }

            fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
            this.log(`Test report saved to: ${reportPath}`, 'INFO');
        } catch (error) {
            this.log(`Failed to save report: ${error.message}`, 'ERROR');
        }
    }
}

// CLI interface
if (require.main === module) {
    const testSuite = new SelfHealingTestSuite();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT. Cleaning up and exiting...');
        await testSuite.cleanup();
        await testSuite.restoreOriginalFiles();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM. Cleaning up and exiting...');
        await testSuite.cleanup();
        await testSuite.restoreOriginalFiles();
        process.exit(0);
    });

    // Parse command line arguments
    const command = process.argv[2];

    switch (command) {
        case 'run':
            testSuite.runAllTests().then(() => {
                console.log('\n🎯 Test suite completed');
                process.exit(testSuite.testResults.failed > 0 ? 1 : 0);
            }).catch(error => {
                console.error('Test suite failed:', error);
                process.exit(1);
            });
            break;

        case 'service-tests':
            console.log('Running service crash tests only...');
            testSuite.testScenarios.service_crashes.forEach(test => {
                testSuite.runTest(test);
            });
            break;

        case 'dependency-tests':
            console.log('Running dependency tests only...');
            testSuite.testScenarios.dependency_issues.forEach(test => {
                testSuite.runTest(test);
            });
            break;

        default:
            console.log('Usage: node self-healing-workflow.test.js [run|service-tests|dependency-tests]');
            console.log('');
            console.log('Commands:');
            console.log('  run             - Run all test scenarios');
            console.log('  service-tests   - Run only service crash tests');
            console.log('  dependency-tests - Run only dependency tests');
            process.exit(1);
    }
}

module.exports = SelfHealingTestSuite;
