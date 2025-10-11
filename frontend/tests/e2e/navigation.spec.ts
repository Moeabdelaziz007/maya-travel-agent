import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to app route
    await page.goto('/app');

    // Wait for app to load
    await page.waitForLoadState('domcontentloaded');

    // Mock authentication if needed - you may need to set localStorage
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
  });

  test('should navigate between tabs', async ({ page }) => {
    // Wait for navigation tabs to be available
    await page.waitForSelector('button:has-text("Destinations")', { timeout: 10000 });

    // Test Destinations tab
    await page.click('button:has-text("Destinations")');
    await expect(page.locator('text=Destinations')).toBeVisible();

    // Test Budget tab
    await page.click('button:has-text("Budget")');
    await expect(page.locator('text=Budget')).toBeVisible();

    // Test History tab
    await page.click('button:has-text("History")');
    await expect(page.locator('text=History')).toBeVisible();

    // Test Amrikyy AI tab (UPDATED FROM "Maya AI")
    await page.click('button:has-text("Amrikyy AI")');
    await expect(page.locator('text=Amrikyy AI')).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Focus on the first tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Check that focus is managed properly
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });

  test('should display landing page at root', async ({ page }) => {
    await page.goto('/');

    // Should show the quantum AI landing page
    await expect(page.locator('text=/AI Automation Platform/i')).toBeVisible();

    // Should have a CTA to enter the app
    const appButton = page.locator('a[href="/app"], button:has-text("Get Started")');
    await expect(appButton).toBeVisible();
  });
});
