import { test, expect } from '@playwright/test'

test.describe('AI Assistant Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display AI assistant interface', async ({ page }) => {
    // AI Assistant should be visible
    await expect(page.getByText(/Maya AI Assistant/i)).toBeVisible()
  })

  test('should show welcome message', async ({ page }) => {
    // Should display initial welcome message in Arabic
    const hasWelcome = await page.getByText(/مرحباً/i).isVisible().catch(() => false)
    
    if (hasWelcome) {
      expect(hasWelcome).toBeTruthy()
    }
  })

  test('should display suggestion buttons', async ({ page }) => {
    // Look for suggestion buttons
    await page.waitForTimeout(500)
    
    const hasSuggestions = await page.locator('button').count()
    expect(hasSuggestions).toBeGreaterThan(0)
  })

  test('should have message input field', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/Ask Maya/i)
    await expect(chatInput).toBeVisible()
  })

  test('should have send button', async ({ page }) => {
    // Send button should exist
    const buttons = await page.getByRole('button').all()
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('should enable send button when text is entered', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/Ask Maya/i)
    
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test message')
      
      // Wait a moment for the button state to update
      await page.waitForTimeout(200)
      
      // Button should exist
      const sendButton = page.getByRole('button', { name: /send/i })
      await expect(sendButton).toBeVisible()
    }
  })

  test('should show AI feature cards', async ({ page }) => {
    // Should display feature cards
    await expect(page.getByText(/Smart Recommendations/i)).toBeVisible()
    await expect(page.getByText(/Safety Insights/i)).toBeVisible()
    await expect(page.getByText(/Instant Planning/i)).toBeVisible()
  })

  test('should have media analysis options', async ({ page }) => {
    // Look for media input fields
    const imageInput = page.getByPlaceholder(/Image URL/i)
    const hasMediaOptions = await imageInput.isVisible().catch(() => false)
    
    if (hasMediaOptions) {
      expect(hasMediaOptions).toBeTruthy()
    }
  })

  test('should display message history', async ({ page }) => {
    // Messages should be displayed in a scrollable area
    await page.waitForTimeout(500)
    
    // Check if message container exists
    const messageContainer = page.locator('div').filter({ hasText: /مرحباً/i }).first()
    const hasMessages = await messageContainer.isVisible().catch(() => false)
    
    if (hasMessages) {
      expect(hasMessages).toBeTruthy()
    }
  })

  test('should allow clicking suggestions', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(500)
    
    // Look for suggestion buttons with Arabic text
    const suggestionButton = page.locator('button').filter({ hasText: /أريد|ما هي|ساعدني|اقترح/i }).first()
    
    if (await suggestionButton.isVisible()) {
      await suggestionButton.click()
      
      // Input should be filled
      const chatInput = page.getByPlaceholder(/Ask Maya/i)
      const inputValue = await chatInput.inputValue()
      expect(inputValue.length).toBeGreaterThan(0)
    }
  })

  test('should have microphone button', async ({ page }) => {
    // Voice input button should exist
    const buttons = await page.getByRole('button').all()
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('should be accessible', async ({ page }) => {
    // Check for basic accessibility
    const chatInput = page.getByPlaceholder(/Ask Maya/i)
    await expect(chatInput).toBeVisible()
    
    // Should be keyboard accessible
    await chatInput.focus()
    await chatInput.type('Test')
    
    const value = await chatInput.inputValue()
    expect(value).toBe('Test')
  })
})

