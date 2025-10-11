import { test, expect } from '@playwright/test'

test.describe('Complete User Journey - New User Plans First Trip', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to simulate logged-in user
    await page.goto('/')

    // Mock API responses for the journey
    await page.route('**/api/v1/trip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            tripId: 'test-trip-123',
            destination: 'Tokyo',
            itinerary: [
              {
                day: 1,
                activities: ['Visit Senso-ji Temple', 'Shibuya Crossing'],
                meals: ['Sushi dinner']
              }
            ],
            estimatedCost: 2500,
            recommendations: ['Book JR Pass', 'Get travel insurance']
          },
          metadata: {
            requestId: 'req-123',
            responseTime: 1500,
            agents: ['flight_search', 'hotel_search', 'conversation']
          }
        })
      })
    })

    await page.route('**/api/v1/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'مرحباً! أهلاً وسهلاً بك في رحلتك الأولى إلى طوكيو! سأكون رفيقتك في هذه التجربة المثيرة. هل تخبرني المزيد عن تفضيلاتك؟',
          conversationId: 'conv-123',
          emotional_context: {
            primary_emotion: 'excitement',
            confidence: 0.8,
            suggested_tone: 'enthusiastic_welcoming'
          },
          friendship_level: 'new_acquaintance'
        })
      })
    })

    await page.route('**/api/v1/skills/empathy', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            primary_emotion: 'excitement',
            confidence: 0.85,
            suggested_tone: 'enthusiastic_welcoming',
            empathy_score: 0.9
          }
        })
      })
    })
  })

  test('should complete full user journey: landing → trip planner → BossAgent → skills → AI chat → emotion detection → friendship progression', async ({ page }) => {
    // Step 1: Landing page and initial interaction
    await expect(page.locator('h1')).toContainText(/amrikyy|travel|رحل/i)

    // Should show trip planner interface
    await expect(page.locator('[data-testid="trip-planner"]')).toBeVisible()

    // Step 2: Navigate to trip planner tab
    await page.click('button:has-text("Trip Planner")')
    await expect(page.locator('[data-testid="trip-planner-form"]')).toBeVisible()

    // Step 3: Fill out trip planning form
    await page.fill('[data-testid="destination-input"]', 'Tokyo')
    await page.fill('[data-testid="travelers-input"]', '2')
    await page.fill('[data-testid="budget-input"]', '3000')
    await page.selectOption('[data-testid="trip-type-select"]', 'cultural')

    // Select dates
    await page.click('[data-testid="departure-date"]')
    await page.click('.react-datepicker__day--today')

    await page.click('[data-testid="return-date"]')
    await page.click('.react-datepicker__day--today + .react-datepicker__day')

    // Step 4: Submit trip planning form
    await page.click('[data-testid="plan-trip-button"]')

    // Should trigger BossAgent orchestration
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()

    // Step 5: Verify BossAgent response
    await expect(page.locator('[data-testid="trip-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="trip-destination"]')).toContainText('Tokyo')
    await expect(page.locator('[data-testid="trip-cost"]')).toContainText('2500')

    // Verify itinerary is displayed
    await expect(page.locator('[data-testid="itinerary-day-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-item"]')).toContainText('Senso-ji Temple')

    // Step 6: Navigate to AI chat for interaction
    await page.click('button:has-text("Amrikyy AI")')

    // Should show AI chat interface
    await expect(page.locator('[data-testid="ai-chat"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible()

    // Step 7: Send message to AI assistant
    await page.fill('[data-testid="chat-input"]', 'مرحبا مايا! متحمس جداً لرحلتي إلى طوكيو!')
    await page.click('[data-testid="send-message"]')

    // Step 8: Verify AI response with emotion detection
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-response"]')).toContainText('مرحباً! أهلاً وسهلاً')

    // Verify emotional context is applied
    await expect(page.locator('[data-testid="emotion-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="emotion-indicator"]')).toHaveClass(/excitement/)

    // Step 9: Continue conversation to test friendship progression
    await page.fill('[data-testid="chat-input"]', 'هل يمكنك مساعدتي في حجز فندق؟')
    await page.click('[data-testid="send-message"]')

    // Verify response and friendship level progression
    await expect(page.locator('[data-testid="ai-response"]:last')).toBeVisible()
    await expect(page.locator('[data-testid="friendship-indicator"]')).toBeVisible()

    // Step 10: Test skills application - empathy detection
    await page.fill('[data-testid="chat-input"]', 'أشعر بالقلق قليلاً من السفر لأول مرة')
    await page.click('[data-testid="send-message"]')

    // Verify empathy detection and appropriate response
    await expect(page.locator('[data-testid="ai-response"]:last')).toBeVisible()
    await expect(page.locator('[data-testid="empathy-response"]')).toContainText(/اطمئن|لا تقلق|سأساعدك/i)

    // Step 11: Verify overall state changes and progression
    // Check that conversation state is maintained
    await expect(page.locator('[data-testid="conversation-state"]')).toBeVisible()

    // Verify trip data is still accessible
    await page.click('button:has-text("Trip Planner")')
    await expect(page.locator('[data-testid="trip-results"]')).toBeVisible()

    // Step 12: Test navigation back to chat and state persistence
    await page.click('button:has-text("Amrikyy AI")')
    await expect(page.locator('[data-testid="chat-message"]')).toHaveCount(3) // Should have 3 messages

    // Step 13: Final friendship progression check
    await page.fill('[data-testid="chat-input"]', 'شكراً لمساعدتك مايا!')
    await page.click('[data-testid="send-message"]')

    // Verify friendship level has progressed
    await expect(page.locator('[data-testid="friendship-level"]')).toContainText(/صديق|رفيق/i)
  })

  test('should handle errors gracefully during user journey', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/v1/trip', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Trip Planner")')

    // Fill form and submit
    await page.fill('[data-testid="destination-input"]', 'Tokyo')
    await page.click('[data-testid="plan-trip-button"]')

    // Should show error message gracefully
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/خطأ|error/i)

    // Should allow retry
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should maintain responsive design throughout journey', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // All elements should be accessible on mobile
    await expect(page.locator('[data-testid="trip-planner"]')).toBeVisible()
    await page.click('button:has-text("Trip Planner")')

    // Form should be usable on mobile
    await expect(page.locator('[data-testid="destination-input"]')).toBeVisible()
    await page.fill('[data-testid="destination-input"]', 'Tokyo')

    // Touch interactions should work
    await page.tap('[data-testid="plan-trip-button"]')
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
  })
})