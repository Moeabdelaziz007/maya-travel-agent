/**
 * Frontend Test Utilities and Helpers
 * Provides utilities for enhanced testing across the application
 */

import { Page } from '@playwright/test';

// Test data generators
export class TestDataGenerator {
  static generateUser() {
    const firstNames = [
      'أحمد',
      'محمد',
      'فاطمة',
      'عائشة',
      'سارة',
      'نور',
      'لينا',
      'جود',
    ];
    const lastNames = [
      'محمد',
      'أحمد',
      'علي',
      'حسن',
      'حسين',
      'عباس',
      'كريم',
      'رحمان',
    ];

    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `test.user.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phone: '+966501234567',
    };
  }

  static generateTripRequest() {
    const destinations = [
      'Tokyo',
      'Dubai',
      'Istanbul',
      'Paris',
      'London',
      'New York',
      'Barcelona',
      'Rome',
    ];
    const tripTypes = [
      'cultural',
      'adventure',
      'relaxation',
      'business',
      'family',
    ];

    return {
      destination:
        destinations[Math.floor(Math.random() * destinations.length)],
      travelers: Math.floor(Math.random() * 4) + 1,
      budget: Math.floor(Math.random() * 5000) + 1000,
      tripType: tripTypes[Math.floor(Math.random() * tripTypes.length)],
      departureDate: this.generateFutureDate(),
      returnDate: this.generateFutureDate(7),
      preferences: {
        accommodation: ['hotel', 'resort', 'apartment'][
          Math.floor(Math.random() * 3)
        ],
        activities: ['sightseeing', 'food', 'shopping', 'adventure'][
          Math.floor(Math.random() * 4)
        ],
        pace: ['relaxed', 'moderate', 'fast'][Math.floor(Math.random() * 3)],
      },
    };
  }

  static generateChatMessage() {
    const messages = [
      'مرحباً مايا! كيف حالك؟',
      'أريد السفر إلى دبي',
      'ما هي أفضل الأماكن السياحية؟',
      'أحتاج مساعدة في حجز فندق',
      'متحمس جداً للرحلة!',
      'هل يمكنك اقتراح خط سير للرحلة؟',
      'أشعر بالقلق من السفر لوحدي',
      'شكراً لمساعدتك!',
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  static generateFutureDate(daysFromNow = 1) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }
}

// API test helpers
export class ApiHelpers {
  static async mockApiResponse(page: Page, endpoint: string, response: any) {
    await page.route(`**${endpoint}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  static async mockApiError(
    page: Page,
    endpoint: string,
    status = 500,
    error = 'Internal server error'
  ) {
    await page.route(`**${endpoint}`, async route => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error,
        }),
      });
    });
  }

  static async waitForApiCall(page: Page, endpoint: string) {
    return page.waitForResponse(
      response => response.url().includes(endpoint) && response.status() === 200
    );
  }
}

// UI interaction helpers
export class UiHelpers {
  static async fillTripPlannerForm(page: Page, tripData: any) {
    await page.fill('[data-testid="destination-input"]', tripData.destination);
    await page.fill(
      '[data-testid="travelers-input"]',
      tripData.travelers.toString()
    );
    await page.fill('[data-testid="budget-input"]', tripData.budget.toString());

    if (tripData.tripType) {
      await page.selectOption(
        '[data-testid="trip-type-select"]',
        tripData.tripType
      );
    }

    if (tripData.departureDate) {
      await page.fill('[data-testid="departure-date"]', tripData.departureDate);
    }

    if (tripData.returnDate) {
      await page.fill('[data-testid="return-date"]', tripData.returnDate);
    }
  }

  static async navigateToTab(page: Page, tabName: string) {
    await page.click(`button:has-text("${tabName}")`);
    await page.waitForSelector(
      `[data-testid="${tabName.toLowerCase().replace(' ', '-')}-tab"]`
    );
  }

  static async waitForLoadingSpinner(page: Page) {
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'visible',
    });
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
    });
  }

  static async takeElementScreenshot(
    page: Page,
    selector: string,
    name: string
  ) {
    const element = page.locator(selector);
    await element.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
}

// Assertion helpers
export class AssertionHelpers {
  static async assertTripResultsVisible(page: Page) {
    await page.waitForSelector('[data-testid="trip-results"]');
    await page.locator('[data-testid="trip-destination"]').isVisible();
    await page.locator('[data-testid="trip-cost"]').isVisible();
    await page.locator('[data-testid="itinerary-day-1"]').isVisible();
  }

  static async assertChatResponse(page: Page, expectedContent?: string) {
    await page.waitForSelector('[data-testid="ai-response"]');

    if (expectedContent) {
      await page
        .locator('[data-testid="ai-response"]')
        .filter({ hasText: expectedContent })
        .isVisible();
    }
  }

  static async assertEmotionDetection(page: Page, expectedEmotion?: string) {
    await page.waitForSelector('[data-testid="emotion-indicator"]');

    if (expectedEmotion) {
      await page
        .locator(
          `[data-testid="emotion-indicator"][data-emotion="${expectedEmotion}"]`
        )
        .isVisible();
    }
  }

  static async assertFriendshipProgression(page: Page, expectedLevel?: string) {
    await page.waitForSelector('[data-testid="friendship-indicator"]');

    if (expectedLevel) {
      await page
        .locator(
          `[data-testid="friendship-level"]:has-text("${expectedLevel}")`
        )
        .isVisible();
    }
  }

  static async assertErrorMessage(page: Page, expectedError?: string) {
    await page.waitForSelector('[data-testid="error-message"]');

    if (expectedError) {
      await page
        .locator(`[data-testid="error-message"]:has-text("${expectedError}")`)
        .isVisible();
    }
  }
}

// Performance measurement helpers
export class PerformanceHelpers {
  static async measurePageLoadTime(page: Page) {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async measureApiResponseTime(page: Page, endpoint: string) {
    const startTime = Date.now();

    await page.waitForResponse(
      response => response.url().includes(endpoint) && response.status() === 200
    );

    return Date.now() - startTime;
  }

  static async measureInteractionTime(page: Page, action: () => Promise<void>) {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }
}

// Accessibility helpers
export class AccessibilityHelpers {
  static async checkPageAccessibility(page: Page) {
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    if (headings === 0) {
      throw new Error('Page should have at least one heading');
    }

    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      console.warn(`${imagesWithoutAlt} images are missing alt text`);
    }

    // Check for proper form labels
    const inputs = await page.locator('input, textarea, select').all();
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        if (!id) return false;
        return !!document.querySelector(`label[for="${id}"]`);
      });

      if (!hasLabel) {
        console.warn(
          'Input missing proper label:',
          await input.getAttribute('name')
        );
      }
    }
  }

  static async checkKeyboardNavigation(page: Page) {
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').first();
    await focusedElement.isVisible();

    // Test enter key on buttons
    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 3)) {
      // Test first 3 buttons
      await button.focus();
      await page.keyboard.press('Enter');
    }
  }
}

// Test configuration helpers
export class TestConfigHelpers {
  static getTestEnvironment() {
    return process.env.TEST_ENV || 'development';
  }

  static isCI() {
    return process.env.CI === 'true';
  }

  static getBrowserConfig() {
    return {
      headless: this.isCI(),
      slowMo: this.isCI() ? 0 : 100,
      viewport: this.isCI() ? { width: 1280, height: 720 } : null,
    };
  }

  static getApiConfig() {
    return {
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.API_TIMEOUT || '30000'),
      retries: parseInt(process.env.API_RETRIES || '3'),
    };
  }
}

// Database test helpers
export class DatabaseHelpers {
  static async cleanupTestData() {
    // Implementation would depend on your database setup
    // This is a placeholder for cleanup logic
    console.log('Cleaning up test data...');
  }

  static async seedTestData() {
    // Implementation would depend on your database setup
    // This is a placeholder for seeding test data
    console.log('Seeding test data...');
  }
}

// Export all helpers as a single object for convenience
export const TestHelpers = {
  data: TestDataGenerator,
  api: ApiHelpers,
  ui: UiHelpers,
  assertions: AssertionHelpers,
  performance: PerformanceHelpers,
  accessibility: AccessibilityHelpers,
  config: TestConfigHelpers,
  database: DatabaseHelpers,
};
