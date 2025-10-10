#!/usr/bin/env node

/**
 * Maya Travel Agent - Complete System Simulation Runner
 * Tests the entire system integration
 */

const SystemSimulation = require('./src/tests/integration/complete-system-simulation.test');

async function runSimulation() {
  console.log('🚀 Maya Travel Agent - Complete System Simulation');
  console.log('================================================\n');

  const simulation = new SystemSimulation();

  try {
    await simulation.runSimulation();

    // Exit with appropriate code
    const exitCode = simulation.testResults.failed > 0 ? 1 : 0;
    process.exit(exitCode);

  } catch (error) {
    console.error('❌ Simulation runner failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run simulation
runSimulation();