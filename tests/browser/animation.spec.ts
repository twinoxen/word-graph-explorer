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

test('the edge animation advances and can pause without moving the player',async({page})=>{
  await page.locator('#edges-animate').click();
  await expect(page.locator('#edges-animate')).toHaveText('Pause animation');
  await expect(page.locator('#edges-stage')).not.toHaveAttribute('data-frame','0');
  await page.locator('#edges-animate').click();
  const frame=await page.locator('#edges-stage').getAttribute('data-frame');
  await page.waitForTimeout(1000);
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame',frame!);
  await page.locator('#edges-replay').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame','0');
  await expect(page.locator('#ladder li')).toHaveCount(1);
});

test('the queue animation reaches the goal and resets the teaching example',async({page})=>{
  await page.locator('#tab-1').click();
  await page.getByRole('button',{name:'BAT',exact:true}).click();
  await page.locator('#bfs-animate').click();
  await expect(page.locator('#demo-current')).toHaveText('DOG',{timeout:10000});
  await expect(page.locator('#demo-note')).toContainText('depth 3');
  await page.locator('#demo-reset').click();
  await expect(page.locator('#demo-current')).toHaveText('CAT');
  await expect(page.locator('#demo-queue')).toHaveText('BATCOT');
});

test('parent tracing and wildcard lookup reveal their intermediate states',async({page})=>{
  await page.locator('#tab-2').click();
  await page.locator('#parents-next').click();
  await expect(page.locator('#parents-caption')).toContainText('COG');
  await page.locator('#parents-next').click();
  await expect(page.locator('#parents-caption')).toContainText('COT');
  await page.locator('#tab-3').click();
  await page.locator('#scale-next').click();
  await expect(page.locator('#scale-caption')).toContainText('C*LD');
  await page.locator('#scale-next').click();
  await expect(page.locator('#scale-caption')).toContainText('COLD and CORD');
  await expect(page.locator('#bucket-words')).toContainText('CORD');
});

test('leaving a slide stops its animation and reduced motion keeps manual steps available',async({page})=>{
  await page.locator('#edges-animate').click();
  await page.locator('#tab-1').click();
  await expect(page.locator('#edges-animate')).toHaveText('Play animation');
  const frame=await page.locator('#edges-stage').getAttribute('data-frame');
  await page.waitForTimeout(1000);
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame',frame!);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#tab-0').click();
  await page.locator('#edges-animate').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame','3');
  await expect(page.locator('#edges-animate')).not.toHaveText('Pause animation');
  await page.locator('#edges-replay').click();
  await page.locator('#edges-next').click();
  await expect(page.locator('#edges-stage')).toHaveAttribute('data-frame','1');
});
