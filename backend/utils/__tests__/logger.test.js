const fs = require('fs');

// Mock the fs module before requiring logger
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Mock console.log
global.console = { 
  log: jest.fn(),
  error: jest.fn()
};

const logger = require('../logger');

describe('Logger', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fs.appendFileSync.mockClear();
    fs.existsSync.mockClear();
    fs.mkdirSync.mockClear();
    console.log.mockClear();
    console.error.mockClear();
    
    // Reset logger level to DEBUG for tests
    logger.currentLevel = logger.logLevels.DEBUG;
  });

  it('should be an instance of Logger', () => {
    expect(logger.constructor.name).toBe('Logger');
  });

  it('should create log directory if it does not exist', () => {
    // This test verifies the directory creation logic
    // Since the logger is already loaded, we test the ensureLogDirectory method directly
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockClear();
    
    // Call the method that creates directories
    logger.ensureLogDirectory();
    
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('should call console.log and fs.appendFileSync for each log level', () => {
    const testMessage = 'This is a test message';
    logger.error(testMessage);
    logger.warn(testMessage);
    logger.info(testMessage);
    logger.debug(testMessage);

    expect(console.log).toHaveBeenCalledTimes(4);
    expect(fs.appendFileSync).toHaveBeenCalledTimes(8); // 4 for level-specific logs, 4 for all.log
  });

  it('should format message correctly', () => {
    const formatted = logger.formatMessage('INFO', 'Test message', { key: 'value' });
    expect(formatted.level).toBe('INFO');
    expect(formatted.message).toBe('Test message');
    expect(formatted.meta).toEqual({ key: 'value' });
    expect(formatted.formatted).toContain('[INFO] Test message {"key":"value"}');
  });

  it('should not log if level is lower than currentLevel', () => {
    const originalLevel = logger.currentLevel;
    logger.currentLevel = logger.logLevels.INFO;
    logger.debug('This should not be logged');
    expect(console.log).not.toHaveBeenCalled();
    logger.currentLevel = originalLevel; // Restore original level
  });

  it('should handle specialized logs', () => {
    logger.apiCall('GET', '/test', 200, 50);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('API GET /test'));

    logger.userAction('123', 'login');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('User action: login'));

    logger.botMessage('456', 'sent', 'Hello');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Bot sent: Hello'));

    logger.performance('db query', 1200);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Performance: db query'));
  });
});
