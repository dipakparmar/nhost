import {
  TEST_PROJECT_NAME,
  TEST_PROJECT_SLUG,
  TEST_WORKSPACE_NAME,
  TEST_WORKSPACE_SLUG,
} from '@/e2e/env';
import { openProject } from '@/e2e/utils';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();

  await page.goto('/');
  await openProject({
    page,
    projectName: TEST_PROJECT_NAME,
    workspaceSlug: TEST_WORKSPACE_SLUG,
    projectSlug: TEST_PROJECT_SLUG,
  });
});

test.afterAll(async () => {
  await page.close();
});

test('should show a sidebar with menu items', async () => {
  const navLocator = page.getByRole('navigation', { name: /main navigation/i });
  await expect(navLocator).toBeVisible();
  await expect(navLocator.getByRole('list').getByRole('listitem')).toHaveCount(
    10,
  );
  await expect(
    navLocator.getByRole('link', { name: /overview/i }),
  ).toBeVisible();
  await expect(
    navLocator.getByRole('link', { name: /database/i }),
  ).toBeVisible();
  await expect(
    navLocator.getByRole('link', { name: /graphql/i }),
  ).toBeVisible();
  await expect(navLocator.getByRole('link', { name: /hasura/i })).toBeVisible();
  await expect(navLocator.getByRole('link', { name: /auth/i })).toBeVisible();
  await expect(
    navLocator.getByRole('link', { name: /storage/i }),
  ).toBeVisible();
  await expect(
    navLocator.getByRole('link', { name: /deployments/i }),
  ).toBeVisible();
  await expect(
    navLocator.getByRole('link', { name: /backups/i }),
  ).toBeVisible();
  await expect(navLocator.getByRole('link', { name: /logs/i })).toBeVisible();
  await expect(
    navLocator.getByRole('link', { name: /settings/i }),
  ).toBeVisible();
});

test('should show a header with a logo, the workspace name, and the project name', async () => {
  await expect(
    page.getByRole('banner').getByRole('link', { name: TEST_WORKSPACE_NAME }),
  ).toBeVisible();

  await expect(
    page.getByRole('banner').getByRole('link', { name: TEST_PROJECT_NAME }),
  ).toBeVisible();
});

test("should show the project's name, the Upgrade button and the Settings button", async () => {
  await expect(
    page.getByRole('heading', { name: TEST_PROJECT_NAME }),
  ).toBeVisible();
  await expect(page.getByText(/free plan/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /upgrade/i })).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('link', { name: /settings/i }),
  ).toBeVisible();
});

test("should show the project's region and subdomain", async () => {
  await expect(page.locator('p:has-text("Region") + div p').nth(0)).toHaveText(
    /frankfurt \(eu-central-1\)/i,
  );
  await expect(
    page.locator('p:has-text("Subdomain") + div p').nth(0),
  ).toHaveText(/[a-z]{20}/i);
});

test('should not have a GitHub repository connected', async () => {
  await expect(
    page.getByRole('button', { name: /connect to github/i }),
  ).toBeVisible();
});

test('should show proper limits for the free project', async () => {
  // Limit for Database
  await expect(page.getByText(/of 500 MB/i)).toBeVisible();

  // Limit for Storage
  await expect(page.getByText(/of 1 GB/i)).toBeVisible();

  // Limit for Users
  await expect(page.getByText(/of 10000/i)).toBeVisible();

  // Limit for Functions
  await expect(page.getByText(/of 10$/i, { exact: true })).toBeVisible();
});
