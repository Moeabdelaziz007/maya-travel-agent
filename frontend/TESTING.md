# Maya Trips Frontend - Testing Guide

## Overview

This document provides comprehensive information about the testing setup and how to run tests for the Maya Trips frontend application.

## Test Coverage

The frontend has comprehensive test coverage including:

### Unit Tests
- ✅ **Components**: All React components tested
  - AIAssistant
  - BudgetTracker
  - Destinations
  - TripHistory
  - ErrorBoundary
  - LoginForm
  - SignupForm
  - PaymentModal
  - TripPlanner

- ✅ **Pages**: All page components tested
  - Analytics
  - PaymentSuccess

- ✅ **API Services**: Integration tests for all services
  - Trip Service
  - Destination Service
  - AI Service
  - Analytics Service
  - Budget Service
  - Payment Service

### End-to-End Tests
- ✅ Authentication flow
- ✅ Navigation between pages
- ✅ Trip planning workflow
- ✅ Payment flow
- ✅ AI Assistant interaction

## Running Tests

### Quick Start

Run all tests with coverage:
```bash
cd frontend
npm run test:coverage
```

### Test Scripts

#### Unit Tests
```bash
# Run tests in watch mode (development)
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

#### End-to-End Tests
```bash
# Run E2E tests (requires dev server running)
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Run specific E2E tests
npm run e2e -- tests/e2e/auth.spec.ts
```

#### All Tests
```bash
# Run comprehensive test suite
./run-all-tests.sh
```

This script will:
1. Run unit tests with coverage
2. Perform type checking
3. Run linting
4. Check code formatting
5. Build the project
6. Run E2E tests (if dev server is available)
7. Generate a comprehensive report

### Code Quality Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-fix formatting
npm run format
```

## Test Structure

### Unit Tests
```
src/
├── components/
│   ├── __tests__/
│   │   ├── AIAssistant.test.tsx
│   │   ├── BudgetTracker.test.tsx
│   │   ├── Destinations.test.tsx
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── LoginForm.test.tsx
│   │   ├── SignupForm.test.tsx
│   │   ├── PaymentModal.test.tsx
│   │   ├── TripHistory.test.tsx
│   │   └── TripPlanner.test.tsx
├── pages/
│   └── __tests__/
│       ├── Analytics.test.tsx
│       └── PaymentSuccess.test.tsx
└── api/
    └── __tests__/
        ├── services.test.ts
        └── paymentService.test.ts
```

### E2E Tests
```
tests/
└── e2e/
    ├── auth.spec.ts
    ├── navigation.spec.ts
    ├── trip-planning.spec.ts
    ├── payment-flow.spec.ts
    └── ai-assistant.spec.ts
```

## Coverage Reports

After running tests with coverage, reports are generated in:
- **HTML Report**: `coverage/index.html` (open in browser)
- **JSON Report**: `coverage/coverage-final.json`
- **Text Summary**: Displayed in terminal

Target Coverage Goals:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Writing Tests

### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should perform action', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Expected')).toBeVisible()
    await page.click('button')
    await expect(page.getByText('Result')).toBeVisible()
  })
})
```

## Testing Technologies

- **Vitest**: Unit test framework (faster alternative to Jest)
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing
- **@testing-library/jest-dom**: Custom matchers for assertions
- **@vitest/ui**: Interactive test UI

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```bash
# CI environment
CI=true npm run test:coverage
CI=true npm run e2e
```

## Troubleshooting

### Tests Failing

1. **Clear cache and reinstall**:
   ```bash
   rm -rf node_modules coverage .vite
   npm install
   ```

2. **Update snapshots** (if using):
   ```bash
   npm run test -- -u
   ```

3. **Check for linting errors**:
   ```bash
   npm run lint:fix
   ```

### E2E Tests Not Running

1. Ensure dev server is running:
   ```bash
   npm run dev
   ```

2. Check port availability (default 3000)

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Best Practices

1. **Write descriptive test names**: Use clear, behavior-focused descriptions
2. **Test user behavior**: Focus on what users do, not implementation details
3. **Keep tests isolated**: Each test should be independent
4. **Mock external dependencies**: Use vi.mock() for API calls
5. **Use semantic queries**: Prefer getByRole, getByText over testIds
6. **Clean up after tests**: Use beforeEach/afterEach appropriately
7. **Test accessibility**: Check for proper ARIA labels and keyboard navigation

## Pre-commit Checklist

Before committing code, ensure:
- [ ] All unit tests pass
- [ ] No linting errors
- [ ] Code is formatted correctly
- [ ] Type checking passes
- [ ] Coverage remains above thresholds
- [ ] E2E tests pass (if changed user flows)

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

For questions or issues with tests, please:
1. Check this documentation
2. Review existing tests for examples
3. Contact the development team

---

**Last Updated**: October 2025
**Maintainer**: Maya Trips Development Team

