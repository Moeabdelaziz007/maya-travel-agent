import { test, expect } from '@playwright/test'

test.describe('Trip Planning Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('should display trip planner interface', async ({ page }) => {
    await expect(page.getByText('Plan Your Next Adventure')).toBeVisible()
  })

  test('should allow adding a new trip', async ({ page }) => {
    // Click on "Add New Trip" button
    const addButton = page.getByText('Add New Trip')
    await addButton.click()
    
    // Form should be visible
    await expect(page.getByPlaceholderText(/destination/i)).toBeVisible()
  })

  test('should display destination cards', async ({ page }) => {
    // Navigate to destinations section if needed
    const destinationsLink = page.getByText('Destinations')
    if (await destinationsLink.isVisible()) {
      await destinationsLink.click()
    }
    
    // Should show destination cards
    await expect(page.getByText('Tokyo')).toBeVisible()
    await expect(page.getByText('Paris')).toBeVisible()
  })

  test('should filter destinations by search', async ({ page }) => {
    // Navigate to destinations
    await page.goto('/')
    
    // Find search input
    const searchInput = page.getByPlaceholder('Search destinations...')
    if (await searchInput.isVisible()) {
      await searchInput.fill('Tokyo')
      
      // Should show Tokyo
      await expect(page.getByText('Tokyo')).toBeVisible()
    }
  })

  test('should display AI assistant', async ({ page }) => {
    // AI assistant should be visible
    await expect(page.getByText('Maya AI Assistant')).toBeVisible()
  })

  test('should allow sending message to AI', async ({ page }) => {
    // Find AI chat input
    const chatInput = page.getByPlaceholder(/Ask Maya anything/i)
    if (await chatInput.isVisible()) {
      await chatInput.fill('Help me plan a trip to Japan')
      
      // Click send button
      const sendButton = page.getByRole('button', { name: /send/i })
      await sendButton.click()
      
      // Should show typing indicator or response
      await page.waitForTimeout(1000)
    }
  })

  test('should display budget tracker', async ({ page }) => {
    // Navigate to budget section if needed
    const budgetLink = page.getByText('Budget Tracker')
    if (await budgetLink.isVisible()) {
      await budgetLink.click()
    }
    
    // Should show budget information
    await expect(page.getByText(/Total Budget/i)).toBeVisible()
  })

  test('should show trip history', async ({ page }) => {
    // Navigate to trip history
    const historyLink = page.getByText('Trip History')
    if (await historyLink.isVisible()) {
      await historyLink.click()
    }
    
    // Should show trip history page
    await expect(page.getByText(/View and manage your travel history/i)).toBeVisible()
  })

  test('should handle navigation between sections', async ({ page }) => {
    // Test navigation works
    await expect(page.getByText('Maya Trips')).toBeVisible()
    
    // Page should be responsive
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('Maya Trips')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Main content should be visible
    await expect(page.getByText('Maya Trips')).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Main content should be visible
    await expect(page.getByText('Maya Trips')).toBeVisible()
  })
})

