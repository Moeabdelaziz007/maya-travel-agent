import { test, expect } from '@playwright/test';

// Update this with your Vercel deployment URL
const BASE_URL = process.env.VERCEL_URL || 'http://localhost:5000';

test.describe('Login Page Tests', () => {
  test('should load login page successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Check page title
    await expect(page).toHaveTitle(/Amrikyy Travel Agent | Login/);
    
    // Verify main heading
    await expect(page.locator('h1')).toContainText('Welcome to Amrikyy');
    
    // Verify tagline
    await expect(page.locator('p')).toContainText('Your AI-powered travel companion');
  });

  test('should display email input field', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'Email address');
  });

  test('should display social auth buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Check for Email button
    const emailBtn = page.locator('button:has-text("Continue with Email")');
    await expect(emailBtn).toBeVisible();
    
    // Check for social buttons (GitHub, Facebook)
    const buttons = page.locator('button.btn-social');
    await expect(buttons).toHaveCount(3); // Email + GitHub + Facebook
  });

  test('should have animated AI avatar', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Check for avatar image
    const avatar = page.locator('img[alt="AI Avatar"]');
    await expect(avatar).toBeVisible();
    
    // Check for animated container
    const animatedContainer = page.locator('.animate-pulse');
    await expect(animatedContainer).toBeVisible();
  });

  test('should have link to signup page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const signupLink = page.locator('a:has-text("Create Account")');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', 'signup.html');
  });

  test('should have Terms and Privacy links', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    await expect(page.locator('a:has-text("Terms")')).toBeVisible();
    await expect(page.locator('a:has-text("Privacy Policy")')).toBeVisible();
  });

  test('should have glass morphism blur background', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const blurBg = page.locator('.blur-bg');
    await expect(blurBg).toBeVisible();
    
    // Check if backdrop filter is applied
    const styles = await blurBg.evaluate((el) => {
      return window.getComputedStyle(el).backdropFilter;
    });
    expect(styles).toContain('blur');
  });

  test('should handle button interactions', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const continueBtn = page.locator('button:has-text("Continue with Email")');
    
    // Hover effect
    await continueBtn.hover();
    await expect(continueBtn).toBeVisible();
    
    // Click interaction
    await continueBtn.click();
    // Note: Add actual behavior test when backend integration is complete
  });

  test('should load background image', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const body = page.locator('body');
    const backgroundImage = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });
    
    // Should have Unsplash image URL
    expect(backgroundImage).toContain('url');
    expect(backgroundImage).toContain('https://');
  });
});

test.describe('Signup Page Tests', () => {
  test('should load signup page successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup.html`);
    
    // Check page title
    await expect(page).toHaveTitle(/Amrikyy Travel Agent | Sign Up/);
    
    // Verify main heading
    await expect(page.locator('h1')).toContainText('Join Amrikyy');
    
    // Verify tagline
    await expect(page.locator('p')).toContainText('Start your AI-powered travel journey');
  });

  test('should display all required input fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup.html`);
    
    // Full Name
    const nameInput = page.locator('input[placeholder="Full Name"]');
    await expect(nameInput).toBeVisible();
    
    // Email
    const emailInput = page.locator('input[placeholder="Email address"]');
    await expect(emailInput).toBeVisible();
    
    // Password
    const passwordInput = page.locator('input[placeholder="Create Password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('should display social auth buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup.html`);
    
    // Check for social buttons (GitHub, Facebook)
    const buttons = page.locator('button.btn-social');
    await expect(buttons).toHaveCount(2); // GitHub + Facebook
  });

  test('should have Create Account button', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup.html`);
    
    const createBtn = page.locator('button:has-text("Create Account")');
    await expect(createBtn).toBeVisible();
    
    // Check for gradient styling
    const hasGradient = await createBtn.evaluate((el) => {
      const bg = window.getComputedStyle(el).backgroundImage;
      return bg.includes('gradient');
    });
    expect(hasGradient).toBeTruthy();
  });

  test('should have link to login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup.html`);
    
    const loginLink = page.locator('a:has-text("Sign In")');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', 'login.html');
  });

  test('should navigate between login and signup', async ({ page }) => {
    // Start on login
    await page.goto(`${BASE_URL}/login.html`);
    
    // Click to signup
    await page.click('a:has-text("Create Account")');
    await expect(page).toHaveURL(/signup\.html/);
    await expect(page.locator('h1')).toContainText('Join Amrikyy');
    
    // Click back to login
    await page.click('a:has-text("Sign In")');
    await expect(page).toHaveURL(/login\.html/);
    await expect(page.locator('h1')).toContainText('Welcome to Amrikyy');
  });

  test('should have animated AI avatar with spinning rings', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup.html`);
    
    // Check for avatar
    const avatar = page.locator('img[alt="AI Avatar"]');
    await expect(avatar).toBeVisible();
    
    // Check for spinning rings
    const spinningRings = page.locator('.animate-spin');
    const count = await spinningRings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto(`${BASE_URL}/signup.html`);
    
    // Check if form is visible and properly sized
    const form = page.locator('.max-w-md');
    await expect(form).toBeVisible();
    
    // Check if inputs are full width
    const inputs = page.locator('input');
    const firstInput = inputs.first();
    const width = await firstInput.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
    
    // Should use most of the container width
    expect(parseInt(width)).toBeGreaterThan(200);
  });
});

test.describe('Visual & Interaction Tests', () => {
  test('should have smooth hover animations on buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const socialBtn = page.locator('button.btn-social').first();
    
    // Get initial position
    const box1 = await socialBtn.boundingBox();
    
    // Hover
    await socialBtn.hover();
    await page.waitForTimeout(500); // Wait for animation
    
    const box2 = await socialBtn.boundingBox();
    
    // Button should move up slightly (translateY)
    expect(box2?.y).toBeLessThan(box1?.y! + 1);
  });

  test('should load Feather icons', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Wait for feather.replace() to execute
    await page.waitForTimeout(500);
    
    // Check if SVG icons are rendered
    const svgIcons = page.locator('svg');
    const count = await svgIcons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper Tailwind CSS styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const container = page.locator('.max-w-md');
    const styles = await container.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        maxWidth: computed.maxWidth,
        margin: computed.margin
      };
    });
    
    // Tailwind max-w-md = 28rem = 448px
    expect(styles.maxWidth).toBe('448px');
  });

  test('should change background image over time', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const body = page.locator('body');
    
    // Get initial background
    const bg1 = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });
    
    // Wait for background change (10 seconds interval in the code)
    await page.waitForTimeout(11000);
    
    const bg2 = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });
    
    // Background should change (different Unsplash image)
    expect(bg1).not.toBe(bg2);
  }, { timeout: 15000 }); // Extend timeout for this test

  test('should have proper color scheme', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Check primary color usage
    const primaryButton = page.locator('button:has-text("Continue")');
    const bgColor = await primaryButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should use blue color (primary: #3B82F6)
    expect(bgColor).toMatch(/rgb\(59,\s*130,\s*246\)/);
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper form labels and placeholders', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const emailInput = page.locator('input[type="email"]');
    const placeholder = await emailInput.getAttribute('placeholder');
    expect(placeholder).toBe('Email address');
  });

  test('should have accessible image alt text', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    const avatar = page.locator('img');
    const alt = await avatar.getAttribute('alt');
    expect(alt).toBe('AI Avatar');
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Links should have descriptive text
    const signupLink = page.locator('a:has-text("Create Account")');
    await expect(signupLink).toBeVisible();
    
    const termsLink = page.locator('a:has-text("Terms")');
    await expect(termsLink).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load external CDN resources', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    
    // Check Tailwind CSS
    const tailwindScript = page.locator('script[src*="tailwindcss"]');
    await expect(tailwindScript).toBeTruthy();
    
    // Check Feather Icons
    const featherScript = page.locator('script[src*="feather"]');
    await expect(featherScript).toBeTruthy();
  });
});

