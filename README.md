# Amrikyy – AI Automation Platform

AI Automation Platform (Frontend + Backend) powered by Amrikyy - Currently featuring Travel Services.

## Features

- 🧠 AI-powered travel recommendations
- 🗺️ Smart trip planning
- 💰 Budget management
- 📱 Modern responsive UI
- 🌍 Global destinations
- 📊 Travel analytics

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express
- MongoDB
- AI Integration

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/USERNAME/Amrikyy-Platform.git
   cd Amrikyy-Platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   # Option 1: Use the start script
   ./start-dev.sh
   
   # Option 2: Manual start
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Development Commands

#### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm run test
npm run test:ui
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Type checking
npm run type-check

# Build for production
npm run build

# E2E testing
npm run e2e
npm run e2e:ui

# Accessibility testing
npm run a11y-check
```

#### Backend Development
```bash
cd backend

# Start development server
npm run dev

# Start production server
npm run start
```

### Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Start production servers
npm run start
```

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── docs/             # Documentation
└── README.md         # Project overview
```

## Testing

### Running Tests
```bash
# Unit tests
cd frontend && npm run test

# E2E tests
cd frontend && npm run e2e

# All tests with coverage
cd frontend && npm run test:coverage
```

### Test Coverage
We aim for >80% test coverage for critical components. Run `npm run test:coverage` to see current coverage.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   rm -rf backend/node_modules backend/package-lock.json
   npm run install:all
   ```

3. **TypeScript errors**
   ```bash
   cd frontend && npm run type-check
   ```

4. **Linting errors**
   ```bash
   cd frontend && npm run lint:fix
   ```

5. **Build failures**
   ```bash
   cd frontend && npm run build
   ```

## Performance

### Bundle Analysis
```bash
cd frontend && npm run build
# Check dist/ folder for bundle sizes
```

### Lighthouse Audit
```bash
# Install lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## Security

### Security Audit
```bash
npm audit
cd frontend && npm audit
cd backend && npm audit
```

### Dependency Updates
```bash
npm update
cd frontend && npm update
cd backend && npm update
```

## Contributing

This project is part of the Amrikyy ecosystem - your intelligent AI automation platform.

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your branch: `git push origin feature/your-feature`
7. Create a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Follow the existing code style
- Update documentation as needed
