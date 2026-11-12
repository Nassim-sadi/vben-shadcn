import type { Locator, Page } from '@playwright/test';

import { expect } from '@playwright/test';

/**
 * The login form mounts through a transition, so for a few frames the captcha
 * wrapper can be visible but still have no layout box. Poll until a usable box
 * exists instead of failing on the first read.
 */
async function getStableBoundingBox(locator: Locator) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const box = await locator.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      return box;
    }
    await locator.page().waitForTimeout(100);
  }
  throw new Error(`元素没有可用的布局区域: ${locator.toString()}`);
}

export async function authLogin(page: Page) {
  // 确保登录表单正常
  const usernameInput = page.locator(`input[name='username']`);
  await expect(usernameInput).toBeVisible();

  const passwordInput = page.locator(`input[name='password']`);
  await expect(passwordInput).toBeVisible();

  const sliderCaptcha = page.locator(`div[name='captcha']`);
  const sliderCaptchaAction = page.locator(`div[name='captcha-action']`);
  await expect(sliderCaptcha).toBeVisible();
  await expect(sliderCaptchaAction).toBeVisible();

  // 拖动验证码滑块
  // 获取拖动按钮的位置
  const sliderCaptchaBox = await getStableBoundingBox(sliderCaptcha);

  const actionBoundingBox = await getStableBoundingBox(sliderCaptchaAction);

  // 计算起始位置和目标位置
  const startX = Math.round(actionBoundingBox.x + actionBoundingBox.width / 2);
  const startY = Math.round(actionBoundingBox.y + actionBoundingBox.height / 2);

  // 目标点要越过滑块轨道末端，否则 moveX 可能等于 offset，
  // 组件不会判定校验通过并会在 mouseup 时复位。
  const targetX = Math.round(sliderCaptchaBox.x + sliderCaptchaBox.width - 2);
  const targetY = startY;

  // 模拟鼠标拖动
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 20 });
  await page.mouse.up();

  // 在拖动后进行断言，检查action是否在预期位置,
  await expect
    .poll(async () => {
      const newActionBoundingBox = await sliderCaptchaAction.boundingBox();
      return newActionBoundingBox?.x ?? actionBoundingBox.x;
    })
    .toBeGreaterThan(actionBoundingBox.x);

  // 到这里已经校验成功，点击进行登录
  await page.getByRole('button', { name: 'login' }).click();
}
