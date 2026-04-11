# Tutorial: Testing (Unit & E2E)

This project uses **Vitest** for unit testing and **Playwright** for end-to-end (E2E) and visual regression testing.

## 1. Unit Testing (Vitest)

Unit tests are used for testing individual components and functions in isolation. These files typically end in `.test.tsx` or `.spec.tsx`.

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
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 2. End-to-End Testing (Playwright)

E2E tests verify the entire user journey by interacting with the application in a real browser. E2E tests are located in the `e2e/` directory.

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
**Note:** Ensure the dev server is running (`npm run dev`) before executing E2E tests.

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npx playwright test --ui
```

---

## 3. Screenshot/Visual Testing

We use a specialized Playwright script to verify UI consistency across all POCs.

### Running Screenshot Tests
```bash
npm run test:screenshots
```
This will generate/verify screenshots located in `e2e/screenshots/`.

---

## Reference Links
-   [Vitest Documentation](https://vitest.dev/guide/)
-   [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
-   [Playwright Documentation](https://playwright.dev/docs/intro)
-   [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
