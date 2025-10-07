import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login form when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Check if login form is visible
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should switch between login and signup forms', async ({ page }) => {
    await page.goto('/')
    
    // Initially should show login form
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible()
    
    // Click sign up button
    await page.click('button:has-text("Sign Up")')
    
    // Should now show signup form
    await expect(page.locator('input[type="password"][name="confirmPassword"]')).toBeVisible()
  })

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible()
  })
})
