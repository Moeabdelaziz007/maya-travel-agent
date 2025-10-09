# 🤝 Contributing to Maya Travel Agent

Thank you for your interest in contributing to Maya Travel Agent! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct that could be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/maya-travel-agent.git
   cd maya-travel-agent
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Moeabdelaziz007/maya-travel-agent.git
   ```

4. **Install dependencies**:
   ```bash
   npm run install:all
   ```

5. **Set up environment variables**:
   ```bash
   # Backend
   cp backend/env.example backend/.env
   
   # Frontend
   cp frontend/env.example frontend/.env
   ```

6. **Start development servers**:
   ```bash
   npm run dev
   ```

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

**Examples**:
- `feature/add-payment-integration`
- `fix/rate-limit-bug`
- `docs/update-api-documentation`

---

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed

---

### 3. Test Your Changes

```bash
# Frontend tests
cd frontend
npm run test
npm run test:coverage
npm run lint
npm run type-check

# Backend tests
cd backend
node test-rate-limits.js

# E2E tests
cd frontend
npm run e2e
```

---

### 4. Commit Your Changes

Follow the commit message guidelines (see below):

```bash
git add .
git commit -m "feat: Add payment integration with Stripe"
```

---

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 💻 Coding Standards

### General Principles

1. **Keep it simple** - Write clear, understandable code
2. **DRY** - Don't Repeat Yourself
3. **SOLID** - Follow SOLID principles
4. **Test** - Write tests for your code
5. **Document** - Add comments for complex logic

---

### JavaScript/TypeScript

#### Style Guide

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Add **semicolons** at the end of statements
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and components
- Use **UPPER_CASE** for constants

#### Example

```typescript
// Good
const userName = 'John Doe';
const MAX_RETRIES = 3;

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

class PaymentService {
  async processPayment(amount: number): Promise<PaymentResult> {
    // Implementation
  }
}

// Bad
const user_name = "John Doe";  // Use camelCase, single quotes
const maxRetries = 3;          // Use UPPER_CASE for constants

function calculate_total(items) {  // Use camelCase
  // Missing type annotations
}
```

---

### React/TypeScript Components

#### Component Structure

```typescript
/**
 * Component description
 * @component
 */

import React, { useState, useEffect } from 'react';
import { SomeType } from '../types';

interface ComponentProps {
  /** Prop description */
  title: string;
  /** Optional prop */
  subtitle?: string;
  /** Callback function */
  onAction: (id: string) => void;
}

/**
 * Component documentation
 */
export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  subtitle, 
  onAction 
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => {
    onAction('123');
  };

  // Render
  return (
    <div className="my-component">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <button onClick={handleClick}>Action</button>
    </div>
  );
};
```

---

### Backend/Node.js

#### Route Structure

```javascript
/**
 * @fileoverview Route description
 * @module routes/example
 */

const express = require('express');
const router = express.Router();

/**
 * Get example data
 * @route GET /api/example
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    // Implementation
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

---

### Comments

#### When to Comment

- **Complex logic** - Explain non-obvious code
- **API endpoints** - Document parameters and responses
- **Public functions** - Add JSDoc comments
- **Workarounds** - Explain why a workaround is needed

#### When NOT to Comment

- **Obvious code** - Don't state what the code does
- **Redundant comments** - Avoid repeating the code

```javascript
// Bad - Obvious
// Increment counter by 1
counter++;

// Good - Explains why
// Increment counter to track failed attempts for rate limiting
failedAttempts++;

// Bad - Redundant
// Get user by ID
const user = getUserById(id);

// Good - Explains business logic
// Fetch user and validate permissions before allowing access
const user = await getUserById(id);
if (!user.hasPermission('admin')) {
  throw new UnauthorizedError();
}
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Scope (Optional)

- `api` - API changes
- `ui` - UI changes
- `auth` - Authentication
- `payment` - Payment system
- `ai` - AI integration
- `telegram` - Telegram bot

### Examples

```bash
# Feature
git commit -m "feat(payment): Add Stripe payment integration"

# Bug fix
git commit -m "fix(api): Fix rate limiting for AI endpoints"

# Documentation
git commit -m "docs: Update API documentation with new endpoints"

# Refactoring
git commit -m "refactor(auth): Simplify authentication logic"

# With body and footer
git commit -m "feat(ai): Add multimodal image analysis

- Implement image upload functionality
- Add Z.ai multimodal API integration
- Create UI for image analysis

Closes #123"
```

### Co-authoring

Always add Ona as co-author:

```bash
git commit -m "feat: Add new feature

Co-authored-by: Ona <no-reply@ona.com>"
```

---

## 🔀 Pull Request Process

### Before Creating PR

1. ✅ Update your branch with latest main
2. ✅ Run all tests
3. ✅ Run linting
4. ✅ Update documentation
5. ✅ Add/update tests for your changes

```bash
# Update branch
git checkout main
git pull upstream main
git checkout your-branch
git rebase main

# Run tests
cd frontend && npm run test && npm run lint
cd ../backend && node test-rate-limits.js

# Push changes
git push origin your-branch --force-with-lease
```

---

### PR Title Format

Use the same format as commit messages:

```
feat(payment): Add Stripe payment integration
fix(api): Fix rate limiting bug
docs: Update contributing guidelines
```

---

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #123
```

---

### PR Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

---

## 🧪 Testing

### Frontend Testing

#### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onAction={handleClick} />);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

#### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('user can create a trip', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  await page.click('text=Plan Trip');
  await page.fill('input[name="destination"]', 'Tokyo');
  await page.fill('input[name="budget"]', '3000');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Trip created')).toBeVisible();
});
```

---

### Backend Testing

```javascript
const request = require('supertest');
const app = require('./server');

describe('API Tests', () => {
  test('GET /api/health returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  test('POST /api/ai/chat requires message', async () => {
    const response = await request(app)
      .post('/api/ai/chat')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

---

## 📚 Documentation

### What to Document

1. **New features** - Add to README and API docs
2. **API changes** - Update API_DOCUMENTATION.md
3. **Configuration** - Update setup guides
4. **Breaking changes** - Clearly document in PR

### Documentation Files

- `README.md` - Project overview and setup
- `API_DOCUMENTATION.md` - API endpoints
- `RATE_LIMITING_GUIDE.md` - Rate limiting info
- `CONTRIBUTING.md` - This file
- Inline code comments - For complex logic

---

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try to reproduce the bug
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox]
- Node version: [e.g., 18.0.0]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other relevant information
```

---

## 🎯 Priority Labels

- `priority: critical` - Security issues, major bugs
- `priority: high` - Important features, significant bugs
- `priority: medium` - Nice-to-have features
- `priority: low` - Minor improvements

---

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Documentation**: Check existing docs first

---

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Maya Travel Agent! 🎉**

Your contributions help make this project better for everyone.
