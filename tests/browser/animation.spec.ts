import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');});

test('the connection map sits between the game and lessons and remains independent',async({page})=>{
  const game=await page.locator('#game').boundingBox();
  const map=await page.locator('#search-lab').boundingBox();
  const learn=await page.locator('#learn').boundingBox();
  expect(game!.y+game!.height).toBeLessThanOrEqual(map!.y);
  expect(map!.y+map!.height).toBeLessThanOrEqual(learn!.y);
  await page.locator('#search-lab').scrollIntoViewIfNeeded();
  await expect(page.locator('canvas')).toBeVisible();
  await page.locator('#step').click();
  await expect(page.locator('#current')).toHaveText('CAT');
  await page.locator('#tab-3').click();
  await expect(page.locator('#search-lab')).toBeVisible();
  await expect(page.locator('#current')).toHaveText('CAT');
});

test('visible lessons play automatically and replay when selected again',async({page})=>{
  await page.locator('#tab-0').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-playing','true');
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame','3',{timeout:7000});
  await page.locator('#tab-1').click();
  await expect(page.locator('#demo-current')).toHaveText('DOG',{timeout:10000});
  await expect(page.locator('#demo-note')).toContainText('depth 3');
  await page.locator('#tab-0').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame','0');
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-playing','true');
  await expect(page.locator('#edges-animate')).toHaveCount(0);
  await expect(page.locator('#demo-step')).toHaveCount(0);
  await expect(page.locator('#ladder li')).toHaveCount(1);
});

test('parent tracing and wildcard lookup advance through intermediate states',async({page})=>{
  await page.locator('#tab-2').click();
  await expect(page.locator('#parents-stage')).toHaveAttribute('data-frame','1');
  await expect(page.locator('#parents-caption')).toContainText('COG');
  await expect(page.locator('#parents-stage')).toHaveAttribute('data-frame','2');
  await expect(page.locator('#parents-caption')).toContainText('COT');
  await page.locator('#tab-3').click();
  await expect(page.locator('#scale-stage')).toHaveAttribute('data-frame','1');
  await expect(page.locator('#scale-caption')).toContainText('C*LD');
  await expect(page.locator('#scale-stage')).toHaveAttribute('data-frame','2');
  await expect(page.locator('#bucket-words')).toContainText('CORD');
});

test('hidden lessons stop and reduced motion shows the completed visual without autoplay',async({page})=>{
  await page.locator('#tab-0').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-playing','true');
  await page.locator('#tab-1').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-playing','false');
  const frame=await page.locator('#edges-stage').getAttribute('data-frame');
  await page.waitForTimeout(1400);
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame',frame!);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#tab-0').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame','3');
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-playing','false');
});
