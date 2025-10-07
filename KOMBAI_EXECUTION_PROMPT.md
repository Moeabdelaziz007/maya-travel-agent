# Kombai AI Execution Prompt: Maya Trips Frontend Improvement & Hardening

## CONTEXT YOU MUST ASSUME
- **Project name**: `Maya Trips - AI Travel Assistant`
- **Repository URL**: `https://github.com/USERNAME/Maya-Trips.git` (provide read/write credentials to Kombai)
- **Primary frontend stack**: `React 18 + TypeScript + Vite + Tailwind CSS`
- **Backend/API**: `Node.js + Express REST API at /api`
- **Test framework**: `Jest + React Testing Library` (to be added)
- **CI provider**: `GitHub Actions` (to be added)
- **Browsers/targets**: `Chrome latest, Firefox latest, Safari latest`
- **UX / accessibility requirements**: `WCAG 2.1 AA`
- **Production environment**: `Vercel/Netlify` (to be configured)

## OBJECTIVE (what Kombai must deliver)
1. Detect, diagnose, and fix frontend bugs and performance regressions in the Maya Trips React application.
2. Improve developer workflow so that feature and bug fixes are reproducible and automated (local dev, CI, linting, tests).
3. Harden quality using automated tests (unit, integration, E2E where applicable), accessibility checks, and security linting.
4. Deliver code changes as modular, reviewed PRs (or patches) with clear explanations and rollback steps.
5. Produce a final Acceptance Report listing all changes, test coverage, performance before/after metrics, and verification commands.

## DELIVERABLE FORMAT (strict)
Kombai must produce a single JSON object (top-level) **and** a human-readable report (Markdown). The JSON keys must include:
- `assumptions` (array of strings)
- `tasks` (array of objects: `{id, title, description, priority, estimated_steps}` )
- `changes` (array of objects: `{file_path, change_type, diff_patch, rationale}`)
- `tests_added` (array of `{type, file, description, run_command}`)
- `ci_changes` (array of `{file, diff_patch, explanation}`)
- `perf_metrics_before` (object)
- `perf_metrics_after` (object)
- `a11y_issues_fixed` (array)
- `security_fixes` (array)
- `verification_commands` (array of shell commands)
- `rollback_instructions` (string)
- `acceptance_criteria` (array)
- `final_status` (`"pass"` or `"fail"`) with reasons if fail

## DETAILED INSTRUCTIONS (step-by-step procedures Kombai must follow)

### 1. Repository onboarding
- Clone the repository and inspect the monorepo structure with `frontend/` and `backend/` workspaces.
- Examine `package.json` files, build scripts, and the current development setup.
- Identify the frontend source root: `frontend/src/` with React components, hooks, and utilities.
- Analyze the current tech stack: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Supabase integration.
- Produce a manifest of project structure: files inspected and their purpose.

### 2. Automated static analysis
- Run TypeScript compiler (`tsc --noEmit`) on the frontend codebase and record all type errors.
- Set up ESLint with TypeScript rules and React-specific rules for the frontend.
- Run Prettier for code formatting consistency.
- Run security linters (`npm audit`) and report critical/high vulnerabilities.
- Add or update configs for ESLint, Prettier, and TypeScript strict mode.
- Document all linting errors and warnings with file context.

### 3. Test discovery and baseline
- **CRITICAL**: The project currently has NO test framework. Add Jest + React Testing Library.
- Set up test configuration with proper TypeScript support.
- Create initial test files for existing components: `App.tsx`, `TripPlanner.tsx`, `Destinations.tsx`, `BudgetTracker.tsx`, `TripHistory.tsx`, `AIAssistant.tsx`.
- Compute baseline test coverage (will be 0% initially).
- Set up E2E testing with Playwright for core user flows.

### 4. Bug triage & prioritization
- Analyze the current codebase for potential issues:
  - Missing error boundaries in React components
  - No loading states for async operations
  - Missing form validation in auth components
  - No error handling for API calls
  - Missing accessibility attributes
  - No responsive design testing
- Create a prioritized bug list: P0 (blockers), P1 (high), P2 (medium).
- For each P0/P1 bug, write deterministic reproduction scripts.

### 5. Fix implementation
**Priority fixes to implement:**
- Add error boundaries to prevent app crashes
- Implement proper loading states for all async operations
- Add form validation to LoginForm and SignupForm components
- Add error handling for API calls in services
- Fix accessibility issues (missing alt texts, ARIA labels, keyboard navigation)
- Add responsive design improvements
- Implement proper TypeScript types for all components
- Add proper error handling for Supabase authentication

### 6. Performance improvements
- Analyze bundle size with Vite build analyzer
- Implement code splitting for route-based components
- Add lazy loading for heavy components
- Optimize images (currently using Unsplash URLs)
- Implement memoization for expensive calculations
- Add service worker for caching
- Measure and report before/after metrics (bundle size, Time to Interactive, LCP)

### 7. Accessibility
- Run automated a11y scanner (axe-core) on all components
- Fix missing alt attributes on images
- Add proper ARIA labels and roles
- Ensure keyboard navigation works properly
- Fix color contrast issues
- Add focus management for modals and forms
- Test with screen readers

### 8. Developer workflow / CI improvements
- Add pre-commit hooks (husky + lint-staged)
- Create GitHub Actions workflow for CI/CD
- Add scripts for: `lint`, `type-check`, `test`, `build`, `a11y-check`
- Set up automated testing on pull requests
- Add dependency vulnerability scanning
- Configure automated deployments

### 9. E2E & regression prevention
- Set up Playwright for E2E testing
- Create smoke tests for:
  - User authentication flow
  - Trip planning workflow
  - Navigation between tabs
  - AI assistant interaction
- Wire E2E tests into CI pipeline
- Add visual regression testing

### 10. Documentation and runbook
- Update README with comprehensive setup instructions
- Add troubleshooting guide for common issues
- Create developer runbook for:
  - Local development setup
  - Testing procedures
  - Deployment process
  - Emergency rollback steps

### 11. Security and dependency hygiene
- Audit all dependencies for vulnerabilities
- Upgrade vulnerable packages safely
- Add security headers to Vite config
- Implement CSP (Content Security Policy)
- Add rate limiting for API calls
- Secure environment variable handling

### 12. Final verification
Create automated verification script that runs:
```bash
# Install dependencies
npm run install:all

# Type checking
cd frontend && npm run type-check

# Linting
cd frontend && npm run lint

# Testing
cd frontend && npm run test

# Build verification
cd frontend && npm run build

# Accessibility check
cd frontend && npm run a11y-check

# Security audit
npm audit
```

### 13. Rollback plan
For every production-affecting change, provide rollback instructions:
- Git revert commands for code changes
- Package downgrade commands for dependency changes
- Configuration rollback steps
- Database migration rollbacks (if applicable)

## ACCEPTANCE CRITERIA (must be checked to mark `final_status: pass`)
- [ ] All P0 issues fixed and have automated tests covering them
- [ ] No new TypeScript errors or ESLint errors introduced; CI passes lint and type-check
- [ ] Test coverage for modified modules increased (target: >80% for critical components)
- [ ] Performance: Bundle size reduction or measurable improvement in Lighthouse metrics
- [ ] Accessibility: All high-priority automated a11y violations fixed
- [ ] Security: No critical vulnerabilities remain unmitigated
- [ ] CI runs successfully and gates merges on lint + test
- [ ] Developer README updated with local reproduction and verification commands
- [ ] Clear rollback plan exists for each production change
- [ ] E2E tests cover critical user journeys

## OUTPUT STANDARDS (how Kombai should present results)
- Use clear, deterministic language
- Include full diffs in unified patch format
- For code suggestions, include exact file path and code block with the new code
- Include git commands to apply changes
- For PRs: include title, description, list of changed files, tests added, reviewers recommended
- Every automated check failure must be labeled with reproduction steps
- Mark items requiring human decisions as `needs-design` with suggested options

## EXAMPLE COMMANDS (Kombai must use when possible)
```bash
# Repository setup
git clone https://github.com/USERNAME/Maya-Trips.git repo && cd repo

# Install dependencies
npm run install:all

# Frontend development
cd frontend
npm run dev
npm run build
npm run type-check
npm run lint
npm run test

# Backend development
cd ../backend
npm run dev
npm run start

# Full application testing
cd ..
npm run dev
```

## SAFETY AND NON-DISRUPTION RULES
- Do not force-push or overwrite protected branches
- All changes must be made in feature branches and presented as PRs
- If dependency upgrades are non-trivial, document risk and require human approval
- If any fix requires secrets not available, mark as `blocked` with exact instructions

## FAILURE MODES & REPORTING
- If any step cannot be completed, produce a `blocked` item with:
  - Root cause
  - Remediation steps
  - Minimal reproduction or log evidence
- Provide timestamps for runs and attach logs (inline up to 2000 lines)

## COMMUNICATION & REVIEW
Each PR must include:
- Short, descriptive title
- One-paragraph summary (what and why)
- Link to failing tests/logs that motivated change
- Manual verification steps
- Risk assessment and rollback plan
- Suggested reviewers: frontend engineer + QA/SRE

## TEMPLATE TO PRODUCE
1. **JSON object** with all required keys as specified
2. **Markdown report** with:
   - Executive summary (3–6 bullet points)
   - What I changed (high level)
   - How to review locally (commands + env)
   - How to verify in CI and in staging/prod
   - Link(s) to PR(s) or patch files
   - Final acceptance checklist with checkboxes

---

**Take a deep breath and work on this problem step-by-step.**
