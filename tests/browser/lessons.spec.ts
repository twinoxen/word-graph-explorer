import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');});
async function slide(page:any,index:number){
  await page.locator(`#chapter-${Math.floor(index/4)}`).click();
  await page.locator(`[data-slide="${index}"]`).click();
}

test('gameplay stays first and twelve lessons expose explanations without a quiz gate',async({page})=>{
  await expect(page.locator('canvas')).toHaveCount(0);
  for(const word of ['cot','cog','dog']){await page.locator('#next').fill(word);await page.locator('#next').press('Enter');}
  await expect(page.locator('#victory')).toBeVisible();
  await expect(page.locator('#lesson-progress')).toHaveText('0 of 12 understood');
  for(let i=0;i<12;i++){
    await slide(page,i);
    await expect(page.locator('#lesson-position')).toHaveText(`Lesson ${i+1} of 12`);
    await expect(page.locator('.lesson-copy>p').first()).toBeVisible();
    await expect(page.locator('.engineering-decision')).toBeVisible();
    await expect(page.locator('#concept-body')).not.toBeEmpty();
  }
  await expect(page.locator('#next-lesson')).toBeDisabled();
});

test('predictions explain misconceptions and persist across navigation without changing the ladder',async({page})=>{
  await slide(page,1);
  await page.locator('[data-choice="1"]').click();
  await expect(page.locator('#prediction-feedback')).toContainText('zero');
  await expect(page.locator('#prediction-feedback')).toHaveAttribute('data-correct','false');
  await page.locator('[data-choice="0"]').click();
  await expect(page.locator('#prediction-feedback')).toHaveAttribute('data-correct','true');
  await expect(page.locator('#lesson-progress')).toHaveText('1 of 12 understood');
  await slide(page,7);await slide(page,1);
  await expect(page.locator('[data-choice="0"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#prediction-feedback')).toContainText('middle letter');
  await expect(page.locator('#ladder li')).toHaveCount(1);
});

test('validation, representation and index experiments respond to learner input',async({page})=>{
  await slide(page,1);
  await page.locator('#validation-word').fill('DOG');
  await expect(page.locator('#validation-announcement')).toContainText('exactly one letter');
  await expect(page.locator('.validation-result')).toContainText('exactly one letter');
  await page.locator('#concept-stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await expect(page.locator('.validation-result')).toContainText('exactly one letter');
  await page.locator('#validation-word').fill('COT');
  await expect(page.locator('.validation-result')).toContainText('every rule passes');
  await slide(page,4);
  await page.locator('#representation').selectOption('set');
  await expect(page.locator('#concept-body')).toContainText('membership queries');
  await page.locator('#representation').selectOption('list');
  await expect(page.locator('.adjacency-list')).toContainText('CAT, COG, DOT');
  await slide(page,7);await page.locator('#dictionary-size').fill('10000');
  await expect(page.locator('#scan-count')).toHaveText('40,000');
  await expect(page.locator('#pattern-count')).toHaveText('4');
  await expect(page.locator('#concept-body')).toContainText('excludes key creation');
});

test('route recovery covers contracts and reveals gameplay only on explicit comparison',async({page})=>{
  await slide(page,11);
  await expect(page.locator('#lesson-solution')).toBeHidden();
  await page.locator('#solver-case').selectOption('same');
  await expect(page.locator('#concept-body')).toContainText('zero moves');
  await page.locator('#solver-case').selectOption('disconnected');
  await expect(page.locator('#concept-caption')).toContainText('returns no route');
  await page.locator('#compare-puzzle').click();
  await expect(page.locator('#lesson-solution')).toContainText('3 moves');
  await page.locator('#next').fill('cot');await page.locator('#next').press('Enter');
  await expect(page.locator('#lesson-solution')).toBeHidden();
  await page.locator('#compare-puzzle').click();await page.locator('#puzzle').selectOption('1');
  await expect(page.locator('#lesson-solution')).toBeHidden();
});

test('chapter keyboard navigation and sequential lessons leave map playback independent',async({page})=>{
  await page.locator('#chapter-0').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('#chapter-1')).toBeFocused();
  await expect(page.locator('#lesson-position')).toHaveText('Lesson 5 of 12');
  await page.keyboard.press('End');await expect(page.locator('#chapter-2')).toBeFocused();
  await page.locator('#previous-lesson').click();await expect(page.locator('#lesson-position')).toHaveText('Lesson 8 of 12');
  await page.locator('#next-lesson').click();await expect(page.locator('#lesson-position')).toHaveText('Lesson 9 of 12');
  await page.locator('#speed').selectOption('1000');await page.locator('#play').click();
  await page.locator('#chapter-0').click();await expect(page.locator('#play')).toContainText('Pause');
  await page.locator('#play').click();
});

test('all twelve lessons stay within a narrow mobile viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(let i=0;i<12;i++){
    await slide(page,i);await page.locator('#concept-stage').scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('#concept-caption')).not.toBeEmpty();
  }
});
