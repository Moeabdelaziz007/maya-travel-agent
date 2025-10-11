import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app route (not landing page)
    await page.goto('/app');
  });

  test('should display login form when not authenticated', async ({ page }) => {
    // Check if login form is visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
  });

  test('should switch between login and signup forms', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Look for sign up trigger
    const signupButton = page.locator('button', { hasText: /sign up|create account/i });

    if (await signupButton.isVisible()) {
      await signupButton.click();

      // Should now show confirm password field (unique to signup)
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error or prevent submission
    const errorMessage = page.locator('text=/invalid|required|valid email/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});
