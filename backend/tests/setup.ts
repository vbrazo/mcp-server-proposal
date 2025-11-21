// Test setup and global mocks

// Set test environment
process.env.NODE_ENV = 'test';
process.env.E2B_API_KEY = 'test_e2b_key';
process.env.GROQ_API_KEY = 'test_groq_key';
process.env.GITHUB_APP_ID = 'test_app_id';
process.env.GITHUB_APP_PRIVATE_KEY = 'test_private_key';
process.env.GITHUB_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/compliance_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.LOG_LEVEL = 'error';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  // Keep error and warn for debugging
};

// Global test timeout
jest.setTimeout(30000);

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

