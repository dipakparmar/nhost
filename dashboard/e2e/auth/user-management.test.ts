import {
  TEST_PROJECT_NAME,
  TEST_PROJECT_SLUG,
  TEST_WORKSPACE_SLUG,
} from '@/e2e/env';
import { openProject } from '@/e2e/utils';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

let page: Page;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();

  await page.goto('/');

  await openProject({
    page,
    projectName: TEST_PROJECT_NAME,
    workspaceSlug: TEST_WORKSPACE_SLUG,
    projectSlug: TEST_PROJECT_SLUG,
  });

  await page
    .getByRole('navigation', { name: /main navigation/i })
    .getByRole('link', { name: /auth/i })
    .click();

  await page.waitForURL(`/${TEST_WORKSPACE_SLUG}/${TEST_PROJECT_SLUG}/users`);
});

test.afterAll(async () => {
  await page.close();
});

test('should create a user', async () => {
  await expect(
    page.getByRole('heading', { name: /there are no users yet/i }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: /create user/i })
    .first()
    .click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /create user/i }),
  ).toBeVisible();

  await page
    .getByRole('textbox', { name: /email/i })
    .fill('testuser@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('test.password');
  await page.getByRole('button', { name: /create/i, exact: true }).click();

  await expect(page.getByRole('dialog')).not.toBeVisible();

  await expect(
    page.getByRole('button', { name: /view testuser@example.com/i }),
  ).toBeVisible();
});

test('should delete a user', async () => {
  await expect(
    page.getByRole('button', { name: /view testuser@example.com/i }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: /more options for testuser@example.com/i })
    .click();
  await page.getByRole('menuitem', { name: /delete user/i }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /delete user/i }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /are you sure you want to delete the "testuser@example.com" user?/i,
    ),
  ).toBeVisible();

  await page.getByRole('button', { name: /delete/i, exact: true }).click();

  await expect(page.getByRole('dialog')).not.toBeVisible();

  await expect(
    page.getByRole('heading', { name: /there are no users yet/i }),
  ).toBeVisible();
});
