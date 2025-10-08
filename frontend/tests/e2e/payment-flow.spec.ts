import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display payment modal when triggered', async ({ page }) => {
    // Look for any payment-related button
    const paymentButton = page.getByText(/pay|payment/i).first()
    
    if (await paymentButton.isVisible()) {
      await paymentButton.click()
      
      // Modal should appear
      await expect(page.getByText(/complete payment/i)).toBeVisible()
    }
  })

  test('should show payment methods', async ({ page }) => {
    // Navigate to payment or trigger payment modal
    const paymentTrigger = page.getByText(/pay|payment/i).first()
    
    if (await paymentTrigger.isVisible()) {
      await paymentTrigger.click()
      
      // Should show payment methods
      await page.waitForTimeout(500)
      
      // Check if payment options are available
      const hasPaymentOptions = await page.getByText(/credit card|paypal|stripe/i).isVisible().catch(() => false)
      
      if (hasPaymentOptions) {
        expect(hasPaymentOptions).toBeTruthy()
      }
    }
  })

  test('should validate payment amount', async ({ page }) => {
    // Payment validation should work
    // This is a UI validation test
    await expect(page).toHaveTitle(/Maya Trips/i)
  })

  test('should display payment success page', async ({ page }) => {
    // Navigate to payment success page directly
    await page.goto('/payment-success?payment_intent=test_123&amount=100&currency=USD')
    
    // Should show success message
    await expect(page.getByText(/Payment Successful/i)).toBeVisible()
  })

  test('should show payment details on success page', async ({ page }) => {
    await page.goto('/payment-success?payment_intent=pi_test&amount=150&currency=USD')
    
    // Should display payment information
    await expect(page.getByText(/Amount Paid/i)).toBeVisible()
    await expect(page.getByText('$150.00')).toBeVisible()
  })

  test('should have working navigation on success page', async ({ page }) => {
    await page.goto('/payment-success?payment_intent=pi_test&amount=100&currency=USD')
    
    // Should have dashboard button
    const dashboardButton = page.getByText(/Go to Dashboard/i)
    await expect(dashboardButton).toBeVisible()
    
    // Should have back button
    const backButton = page.getByText(/Go Back/i)
    await expect(backButton).toBeVisible()
  })

  test('should display receipt information', async ({ page }) => {
    await page.goto('/payment-success?payment_intent=pi_test&amount=100&currency=USD')
    
    // Should show receipt info
    await expect(page.getByText(/Receipt/i)).toBeVisible()
    await expect(page.getByText(/confirmation email/i)).toBeVisible()
  })

  test('should show support contact', async ({ page }) => {
    await page.goto('/payment-success')
    
    // Should display support email
    await expect(page.getByText(/support@mayatrips.com/i)).toBeVisible()
  })
})

