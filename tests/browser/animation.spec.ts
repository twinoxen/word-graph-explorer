import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');});

test('the independent connection map remains between the game and the course',async({page})=>{
  const game=await page.locator('#game').boundingBox(),map=await page.locator('#search-lab').boundingBox(),learn=await page.locator('#learn').boundingBox();
  expect(game!.y+game!.height).toBeLessThanOrEqual(map!.y);expect(map!.y+map!.height).toBeLessThanOrEqual(learn!.y);
  await page.locator('#search-lab').scrollIntoViewIfNeeded();await expect(page.locator('canvas')).toBeVisible();
  await page.locator('#step').click();await expect(page.locator('#current')).toHaveText('CAT');
  await page.locator('#chapter-2').click();await expect(page.locator('#current')).toHaveText('CAT');
});

test('lessons autoplay when visible and dispose the old animation when switching',async({page})=>{
  await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-playing','true');
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-frame','2');
  await page.locator('[data-slide="1"]').click();await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-frame','0');
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-playing','true');
  await page.locator('[data-slide="0"]').click();await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-frame','0');
  await expect(page.locator('#learn .animation-controls')).toHaveCount(0);
});

test('BFS operation animation synchronizes pseudocode with a real discovery',async({page})=>{
  await page.locator('#chapter-2').click();await page.locator('[data-slide="9"]').click();
  await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept-caption')).toContainText('discovers BAT',{timeout:6000});
  await expect(page.locator('.code-walkthrough li.is-active')).toHaveCount(2);
  await expect(page.locator('.structure-list')).toContainText('BAT ← CAT');
  await expect(page.locator('#ladder li')).toHaveCount(1);
});

test('reduced motion shows complete visuals and fast navigation never resumes disposed slides',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#chapter-2').click();await page.locator('[data-slide="9"]').click();
  await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept-caption')).toContainText('goal DOG');
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-playing','false');
  for(let i=0;i<3;i++){await page.locator('#chapter-0').click();await page.locator('#chapter-2').click();}
  await page.locator('[data-slide="11"]').click();await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept-caption')).toContainText('route contract');
  await page.waitForTimeout(1400);
  await expect(page.locator('#concept-caption')).toContainText('route contract');
  await expect(page.locator('#concept-stage')).toHaveAttribute('data-playing','false');
});
