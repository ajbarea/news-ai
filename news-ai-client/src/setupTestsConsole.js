// Store the original console.error
const originalConsoleError = console.error;

// Mock console.error before each test
beforeEach(() => {
  console.error = jest.fn();
});

// Restore console.error after each test
afterEach(() => {
  console.error = originalConsoleError;
});
