# Tutorial: Testing (Unit & E2E)

This project uses **Vitest** for unit testing and **Playwright** for end-to-end (E2E) and render-health screenshot captures.

## 1. Unit Testing (Vitest)

Unit tests are used for testing individual components and functions in isolation. These files typically end in `.test.tsx` or `.spec.tsx`.

Vitest enforces an **80%** coverage gate for lines, functions, branches, and statements (`vitest.config.ts`). `src/config/**` is excluded from coverage. `npm test` runs `vitest run --coverage`. Do not set `coverage.all`.

### Creating a Unit Test
Example: `src/components/MyComponent.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders the correct title', () => {
    render(<MyComponent title="Hello Test" />)
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })
})
```

### Running Unit Tests
```bash
# Run all tests once (includes coverage)
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 2. End-to-End Testing (Playwright)

E2E tests verify the entire user journey by interacting with the application in a real browser. E2E tests are located in the `e2e/` directory.

Playwright's `webServer` config auto-starts `npm run dev` (Vite on port 5180, which also starts the Hono backend). You do not need to start the dev server yourself unless you want to reuse an already-running instance locally (`reuseExistingServer` is enabled outside CI).

Install browsers once per machine:

```bash
npx playwright install
```

### Creating an E2E Test
Example: `e2e/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('user can navigate to the new POC', async ({ page }) => {
  await page.goto('/')
  
  // Click on the POC card
  await page.click('text=My New Feature')
  
  // Verify the URL and page header
  await expect(page).toHaveURL(/.*my-new-feature/)
  await expect(page.locator('h1')).toContainText('My New Feature')
})
```

### Running E2E Tests
```bash
# Run all E2E tests (Playwright starts npm run dev)
npm run test:e2e

# Run with UI mode
npx playwright test --ui
```

---

## 3. Screenshot / Render-Health Captures

`npm run test:screenshots` takes full-page screenshots of each path in `e2e/screenshots.spec.ts` `POC_PATHS` and writes them to `e2e/screenshots/`. These are **render-health captures overwritten each run**, not visual regression tests — Playwright does not diff pixels against a baseline. The real assertion is that the page loads (h1 visible) without console errors.

Keep `POC_PATHS` in sync by hand when adding a POC; it is not derived from `POC_CONFIG`.

### Running Screenshot Tests
```bash
npm run test:screenshots
```
This overwrites PNGs in `e2e/screenshots/` on every run.

---

## 4. CI platforms

GitHub Actions (`ci.yml`) runs lint, `npm run build`, Vitest coverage, and Playwright Chromium on **ubuntu-latest** and **macos-latest** (`fail-fast: false`). Security scanning stays Linux-only. Windows is unsupported.

---

## Reference Links
-   [Vitest Documentation](https://vitest.dev/guide/)
-   [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
-   [Playwright Documentation](https://playwright.dev/docs/intro)
