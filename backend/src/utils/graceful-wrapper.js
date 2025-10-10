/**
 * Graceful Degradation - Wrap risky operations
 * Ensures partial success instead of complete failure
 */

async function gracefulExecute(operation, fallbackValue = null, context = '') {
  try {
    return await operation();
  } catch (error) {
    console.warn(`[GracefulWrapper] ⚠️ ${context} failed:`, error.message);
    console.warn('[GracefulWrapper] Returning fallback value');
    return fallbackValue;
  }
}

function gracefulSync(operation, fallbackValue = null, context = '') {
  try {
    return operation();
  } catch (error) {
    console.warn(`[GracefulWrapper] ⚠️ ${context} failed:`, error.message);
    return fallbackValue;
  }
}

module.exports = {
  gracefulExecute,
  gracefulSync
};
