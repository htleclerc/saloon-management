import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Workshop Manager/);
});

test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/BraidHub|Welcome|Login|Email/i);
});
