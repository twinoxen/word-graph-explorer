import {test,expect,type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
async function fingerprint(page:Page){return createHash('sha256').update(await page.locator('canvas').evaluate((canvas:HTMLCanvasElement)=>canvas.toDataURL())).digest('hex');}
async function move(page:Page,word:string){await page.locator('#next').fill(word);await page.locator('#next').press('Enter');}
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.locator('canvas')).toBeVisible();});
test('invalid changes show live errors and submission feedback',async({page})=>{
  await page.locator('#next').fill('dog');
  await expect(page.locator('#next')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#message')).toHaveAttribute('data-tone','error');
  await expect(page.locator('#message')).toContainText('exactly one');
  await page.locator('#next').press('Enter');
  await expect(page.locator('#toast')).toBeVisible();
  await expect(page.locator('#toast')).toContainText('exactly one');
  await expect(page.locator('#ladder li')).toHaveCount(1);
  await page.locator('#next').fill('cot');
  await expect(page.locator('#next')).toHaveAttribute('aria-invalid','false');
  await expect(page.locator('#message')).toContainText('Valid');
  await expect(page.locator('#toast')).toBeHidden({timeout:500});
});
test('winning celebrates and undo clears the victory state',async({page})=>{
  await move(page,'cot');await move(page,'cog');await move(page,'dog');
  await expect(page.locator('#victory')).toBeVisible();
  await expect(page.locator('#victory')).toContainText('You connected CAT to DOG');
  await expect(page.locator('#victory')).toContainText('3 moves');
  await expect(page.locator('#victory')).toContainText('shortest');
  await expect(page.locator('#next')).toBeDisabled();
  await expect(page.locator('#submit-move')).toBeDisabled();
  await expect(page.locator('#confetti i').first()).toBeAttached();
  await page.locator('#undo').click();
  await expect(page.locator('#victory')).toBeHidden();
  await expect(page.locator('#confetti')).toBeEmpty();
  await expect(page.locator('#next')).toBeEnabled();
  await page.locator('#restart').click();
  await expect(page.locator('#message')).not.toHaveAttribute('data-tone','error');
});
test('active connectors animate and reduced motion keeps them still',async({page})=>{
  await move(page,'cot');
  const before=await fingerprint(page);
  await expect.poll(()=>fingerprint(page)).not.toBe(before);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>fingerprint(page)).not.toBe(before);
  await page.waitForTimeout(150);
  const still=await fingerprint(page);
  await page.waitForTimeout(200);
  expect(await fingerprint(page)).toBe(still);
});
test('reduced-motion win keeps feedback without confetti',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await move(page,'cot');await move(page,'cog');await move(page,'dog');
  await expect(page.locator('#victory')).toBeVisible();
  await expect(page.locator('#confetti')).toBeEmpty();
});
test('mobile feedback stays in view without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await move(page,'dog');
  await expect(page.locator('#toast')).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('next challenge clears celebration and starts a fresh puzzle',async({page})=>{
  await move(page,'cot');await move(page,'cog');await move(page,'dog');
  await page.locator('#next-challenge').click();
  await expect(page.locator('#start')).toHaveText('COLD');
  await expect(page.locator('#goal')).toHaveText('WARM');
  await expect(page.locator('#victory')).toBeHidden();
  await expect(page.locator('#confetti')).toBeEmpty();
  await expect(page.locator('#toast')).toBeHidden();
  await expect(page.locator('#next')).toBeEnabled();
  await expect(page.locator('#ladder li')).toHaveCount(1);
});
