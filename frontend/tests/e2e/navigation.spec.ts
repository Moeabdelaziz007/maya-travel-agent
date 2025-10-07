import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for these tests
    await page.goto('/')
    // Add authentication mock here
  })

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to different tabs
    await page.click('button:has-text("Destinations")')
    await expect(page.locator('text=Destinations')).toBeVisible()
    
    await page.click('button:has-text("Budget")')
    await expect(page.locator('text=Budget')).toBeVisible()
    
    await page.click('button:has-text("History")')
    await expect(page.locator('text=History')).toBeVisible()
    
    await page.click('button:has-text("Maya AI")')
    await expect(page.locator('text=Maya AI')).toBeVisible()
  })

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should navigate to the focused tab
    await expect(page.locator('[aria-selected="true"]')).toBeVisible()
  })
})
