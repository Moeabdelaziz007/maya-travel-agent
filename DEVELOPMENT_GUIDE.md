# 🛠️ Development Guide - Maya Travel Agent

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## Development Environment Setup

### Required Tools

1. **Node.js & npm**
   ```bash
   # Check versions
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0
   ```

2. **Git**
   ```bash
   git --version
   ```

3. **Code Editor**
   - **VS Code** (Recommended)
   - Install extensions:
     - ESLint
     - Prettier
     - TypeScript and JavaScript Language Features
     - Tailwind CSS IntelliSense
     - GitLens

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "eamodio.gitlens",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Project Structure

### Monorepo Layout

```
maya-travel-agent/
├── frontend/           # React application
├── backend/            # Node.js server
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── package.json       # Root workspace config
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/           # API client services
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app
│   └── main.tsx       # Entry point
├── tests/             # E2E tests
├── public/            # Static assets
└── vite.config.ts     # Vite config
```

### Backend Structure

```
backend/
├── src/
│   ├── ai/            # AI integration
│   └── whatsapp/      # WhatsApp client
├── routes/            # API routes
├── middleware/        # Express middleware
├── database/          # Database clients
├── utils/             # Utilities
└── server.js          # Main server
```

---

## Development Workflow

### 1. Starting Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

### 2. Making Changes

#### Frontend Changes

1. **Create/Edit Component**
   ```bash
   cd frontend/src/components
   # Create new component
   touch MyComponent.tsx
   ```

2. **Component Template**
   ```typescript
   /**
    * MyComponent - Brief description
    * @component
    */
   import React from 'react';
   
   interface MyComponentProps {
     title: string;
     onAction?: () => void;
   }
   
   export const MyComponent: React.FC<MyComponentProps> = ({ 
     title, 
     onAction 
   }) => {
     return (
       <div className="my-component">
         <h2>{title}</h2>
         {onAction && (
           <button onClick={onAction}>Action</button>
         )}
       </div>
     );
   };
   ```

3. **Add Tests**
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { render, screen } from '@testing-library/react';
   import { MyComponent } from './MyComponent';
   
   describe('MyComponent', () => {
     it('renders title', () => {
       render(<MyComponent title="Test" />);
       expect(screen.getByText('Test')).toBeInTheDocument();
     });
   });
   ```

#### Backend Changes

1. **Create/Edit Route**
   ```bash
   cd backend/routes
   # Create new route
   touch my-route.js
   ```

2. **Route Template**
   ```javascript
   /**
    * @fileoverview My Route Description
    * @module routes/my-route
    */
   
   const express = require('express');
   const router = express.Router();
   
   /**
    * Get data
    * @route GET /api/my-route
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

3. **Register Route in server.js**
   ```javascript
   const myRoute = require('./routes/my-route');
   app.use('/api/my-route', myRoute);
   ```

### 3. Testing Changes

```bash
# Frontend tests
cd frontend
npm run test
npm run lint
npm run type-check

# Backend tests
cd backend
node test-rate-limits.js
```

### 4. Committing Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(component): Add new feature

- Detail 1
- Detail 2

Co-authored-by: Ona <no-reply@ona.com>"

# Push to your branch
git push origin your-branch
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Create Route Handler**
   ```javascript
   // backend/routes/my-feature.js
   const express = require('express');
   const router = express.Router();
   
   router.post('/action', async (req, res) => {
     const { param } = req.body;
     
     if (!param) {
       return res.status(400).json({
         success: false,
         error: 'Parameter required'
       });
     }
     
     // Process request
     res.json({ success: true, result: 'done' });
   });
   
   module.exports = router;
   ```

2. **Add Rate Limiting**
   ```javascript
   const { createCustomLimiter } = require('../middleware/rateLimiter');
   
   const myFeatureLimiter = createCustomLimiter({
     windowMs: 60 * 1000,
     max: 20
   });
   
   router.post('/action', myFeatureLimiter, async (req, res) => {
     // Handler
   });
   ```

3. **Register in server.js**
   ```javascript
   const myFeatureRoutes = require('./routes/my-feature');
   app.use('/api/my-feature', myFeatureRoutes);
   ```

4. **Update OpenAPI Spec**
   ```json
   {
     "/my-feature/action": {
       "post": {
         "tags": ["MyFeature"],
         "summary": "Perform action",
         "requestBody": {
           "required": true,
           "content": {
             "application/json": {
               "schema": {
                 "type": "object",
                 "required": ["param"],
                 "properties": {
                   "param": { "type": "string" }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

5. **Create Frontend Service**
   ```typescript
   // frontend/src/api/myFeatureService.ts
   import { apiClient } from './client';
   
   export const myFeatureService = {
     async performAction(param: string) {
       return apiClient.post('/my-feature/action', { param });
     }
   };
   ```

### Adding a New Component

1. **Create Component File**
   ```typescript
   // frontend/src/components/MyFeature.tsx
   import React, { useState } from 'react';
   import { myFeatureService } from '../api/myFeatureService';
   
   export const MyFeature: React.FC = () => {
     const [loading, setLoading] = useState(false);
     
     const handleAction = async () => {
       setLoading(true);
       try {
         await myFeatureService.performAction('value');
       } catch (error) {
         console.error(error);
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <div>
         <button onClick={handleAction} disabled={loading}>
           {loading ? 'Loading...' : 'Action'}
         </button>
       </div>
     );
   };
   ```

2. **Add Types**
   ```typescript
   // frontend/src/types/index.ts
   export interface MyFeatureData {
     id: string;
     name: string;
     value: number;
   }
   ```

3. **Add Tests**
   ```typescript
   // frontend/src/components/__tests__/MyFeature.test.tsx
   import { describe, it, expect, vi } from 'vitest';
   import { render, screen, fireEvent } from '@testing-library/react';
   import { MyFeature } from '../MyFeature';
   
   describe('MyFeature', () => {
     it('renders button', () => {
       render(<MyFeature />);
       expect(screen.getByText('Action')).toBeInTheDocument();
     });
   });
   ```

### Adding Database Table

1. **Create Migration SQL**
   ```sql
   -- migrations/001_add_my_table.sql
   CREATE TABLE IF NOT EXISTS my_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     value INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Add RLS policies
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own data"
     ON my_table FOR SELECT
     USING (auth.uid() = user_id);
   ```

2. **Add to Supabase Client**
   ```javascript
   // backend/database/supabase.js
   async getMyData(userId) {
     const { data, error } = await this.supabase
       .from('my_table')
       .select('*')
       .eq('user_id', userId);
     
     if (error) throw error;
     return data;
   }
   ```

3. **Add TypeScript Types**
   ```typescript
   // frontend/src/types/index.ts
   export interface MyTableRow {
     id: string;
     name: string;
     value: number;
     created_at: string;
     updated_at: string;
   }
   ```

---

## Debugging

### Frontend Debugging

#### Browser DevTools

1. **Console Logging**
   ```typescript
   console.log('Debug:', data);
   console.error('Error:', error);
   console.table(arrayData);
   ```

2. **React DevTools**
   - Install React DevTools extension
   - Inspect component props and state
   - Profile component performance

3. **Network Tab**
   - Monitor API requests
   - Check request/response data
   - Verify headers and status codes

#### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

### Backend Debugging

#### Console Logging

```javascript
console.log('Request:', req.body);
console.error('Error:', error);
console.dir(object, { depth: null });
```

#### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/server.js",
  "cwd": "${workspaceFolder}/backend",
  "env": {
    "NODE_ENV": "development"
  }
}
```

#### Using Node Inspector

```bash
# Start with inspector
node --inspect backend/server.js

# Open chrome://inspect in Chrome
# Click "inspect" on your Node process
```

### Common Debugging Scenarios

#### API Request Failing

1. **Check Network Tab**
   - Verify request URL
   - Check request method (GET, POST, etc.)
   - Verify request body

2. **Check Backend Logs**
   ```bash
   tail -f backend/logs/all.log
   ```

3. **Test with cURL**
   ```bash
   curl -X POST http://localhost:5000/api/endpoint \
     -H "Content-Type: application/json" \
     -d '{"key":"value"}'
   ```

#### Rate Limit Issues

1. **Check Rate Limit Headers**
   ```javascript
   console.log('Remaining:', response.headers['ratelimit-remaining']);
   console.log('Reset:', response.headers['ratelimit-reset']);
   ```

2. **Wait for Reset**
   ```javascript
   if (response.status === 429) {
     const retryAfter = response.data.retryAfter;
     await sleep(retryAfter * 1000);
     // Retry request
   }
   ```

#### Database Connection Issues

1. **Check Environment Variables**
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Test Connection**
   ```javascript
   const { data, error } = await supabase
     .from('users')
     .select('count');
   
   console.log('Connection test:', { data, error });
   ```

---

## Performance Optimization

### Frontend Optimization

#### 1. Code Splitting

```typescript
// Lazy load components
const MyComponent = React.lazy(() => import('./MyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <MyComponent />
    </Suspense>
  );
}
```

#### 2. Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize components
const MemoizedComponent = React.memo(MyComponent);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### 3. Debouncing

```typescript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => {
    performSearch(query);
  }, 300),
  []
);
```

#### 4. Image Optimization

```typescript
// Use appropriate image formats
<img 
  src="image.webp" 
  alt="Description"
  loading="lazy"
  width="400"
  height="300"
/>
```

### Backend Optimization

#### 1. Database Queries

```javascript
// Use indexes
CREATE INDEX idx_user_id ON trips(user_id);

// Limit results
const { data } = await supabase
  .from('trips')
  .select('*')
  .limit(20);

// Use pagination
const { data } = await supabase
  .from('trips')
  .select('*')
  .range(0, 19);
```

#### 2. Caching

```javascript
const cache = new Map();

async function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchData(key);
  cache.set(key, data);
  
  // Expire after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return data;
}
```

#### 3. Response Compression

```javascript
// Already enabled in server.js
const compression = require('compression');
app.use(compression());
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -ti:3000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:5000)
```

#### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

#### TypeScript Errors

```bash
# Check types
cd frontend
npm run type-check

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

#### Build Failures

```bash
# Clear cache
rm -rf frontend/dist
rm -rf frontend/.vite

# Rebuild
cd frontend
npm run build
```

#### Git Issues

```bash
# Reset to last commit
git reset --hard HEAD

# Clean untracked files
git clean -fd

# Pull latest changes
git pull origin main
```

---

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### Production

```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error
```

---

## Useful Commands

### Package Management

```bash
# Add dependency
npm install package-name

# Add dev dependency
npm install -D package-name

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### Git Commands

```bash
# Create branch
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit
git commit -m "feat: Add feature"

# Push
git push origin feature/my-feature

# Pull latest
git pull origin main

# Rebase
git rebase main
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run specific test
npm run test MyComponent

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage
```

---

## Best Practices

1. **Always read files before editing**
2. **Write tests for new features**
3. **Follow coding standards**
4. **Use meaningful commit messages**
5. **Keep PRs small and focused**
6. **Document complex logic**
7. **Handle errors gracefully**
8. **Optimize for performance**
9. **Ensure accessibility**
10. **Review your own code before submitting**

---

**Last Updated**: 2024-10-09  
**Version**: 1.0.0  
**Maintained by**: Maya Trips Team
