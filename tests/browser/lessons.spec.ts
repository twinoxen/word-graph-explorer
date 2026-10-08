import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');});

test('learning remains optional while a player completes the game',async({page})=>{
  await expect(page.locator('canvas')).toHaveCount(0);
  const game=await page.locator('#game').boundingBox();
  const learn=await page.locator('#learn').boundingBox();
  expect(game!.y+game!.height).toBeLessThanOrEqual(learn!.y);
  for(const word of ['cot','cog','dog']){
    await page.locator('#next').fill(word);await page.locator('#next').press('Enter');
  }
  await expect(page.locator('#victory')).toBeVisible();
  await expect(page.locator('#lesson-progress')).toContainText('0 of 4');
});

test('adjacency lesson gives feedback for both predictions without changing the game',async({page})=>{
  await page.getByRole('button',{name:'DOG',exact:true}).click();
  await expect(page.locator('#edges-feedback')).toContainText('three');
  await expect(page.locator('#edges-feedback')).toHaveAttribute('data-correct','false');
  await page.getByRole('button',{name:'COT',exact:true}).click();
  await expect(page.locator('#edges-feedback')).toHaveAttribute('data-correct','true');
  await expect(page.locator('#edges-explanation')).toBeVisible();
  await expect(page.locator('#ladder li')).toHaveCount(1);
  await expect(page.locator('#lesson-progress')).toContainText('1 of 4');
});

test('FIFO lesson steps a real queue and resets without affecting the player',async({page})=>{
  await page.getByRole('tab',{name:/Search in rings/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button',{name:'COT',exact:true}).click();
  await expect(page.locator('#bfs-feedback')).toHaveAttribute('data-correct','false');
  await page.getByRole('button',{name:'BAT',exact:true}).click();
  await expect(page.locator('#demo-queue')).toHaveText('BATCOT');
  await page.getByRole('button',{name:'Explore next word'}).click();
  await expect(page.locator('#demo-current')).toHaveText('BAT');
  await expect(page.locator('#demo-queue')).toHaveText('COT');
  await page.getByRole('button',{name:'Explore next word'}).click();
  await expect(page.locator('#demo-queue')).toHaveText('COGDOT');
  await page.getByRole('button',{name:'Reset example'}).click();
  await expect(page.locator('#demo-queue')).toHaveText('BATCOT');
  await expect(page.locator('#ladder li')).toHaveCount(1);
});

test('shortest-path lesson explains parents and compares the active puzzle only on request',async({page})=>{
  await page.getByRole('tab',{name:/Shortest route/}).click();
  await expect(page.locator('#lesson-solution')).toBeHidden();
  await page.getByRole('button',{name:'Follow the recorded parents'}).click();
  await expect(page.locator('#parents-feedback')).toHaveAttribute('data-correct','true');
  await expect(page.locator('#parent-trace')).toContainText('DOG ← COG ← COT ← CAT');
  await page.getByRole('button',{name:'Compare with my puzzle'}).click();
  await expect(page.locator('#lesson-solution')).toContainText('3 moves');
  await page.locator('#puzzle').selectOption('1');
  await expect(page.locator('#lesson-solution')).toBeHidden();
});

test('scaling lesson distinguishes lookup work from building an index',async({page})=>{
  await page.getByRole('tab',{name:/Scale it up/}).click();
  await page.locator('#dictionary-size').fill('10000');
  await expect(page.locator('#scan-count')).toHaveText('40,000');
  await expect(page.locator('#pattern-count')).toHaveText('4');
  await page.getByRole('button',{name:'Reuse a wildcard index'}).click();
  await expect(page.locator('#scale-feedback')).toHaveAttribute('data-correct','true');
  await expect(page.locator('#scale-explanation')).toContainText('build');
  await page.getByRole('tab',{name:/Words become a graph/}).click();
  await expect(page.locator('#lesson-edges')).toBeVisible();
});

test('keyboard navigation changes lessons and leaving search pauses playback',async({page})=>{
  await page.locator('#tab-0').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-1')).toBeFocused();
  await expect(page.locator('#lesson-bfs')).toBeVisible();
  await page.locator('#speed').selectOption('1000');await page.locator('#play').click();
  await expect(page.locator('#play')).toContainText('Pause');
  await page.getByRole('tab',{name:/Shortest route/}).click();
  await expect(page.locator('#play')).toContainText('Play BFS');
  const current=await page.locator('#current').textContent();
  await page.waitForTimeout(1100);
  await expect(page.locator('#current')).toHaveText(current!);
});

test('mobile lessons keep their controls usable without page overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#next')).toBeInViewport();
  for(const name of [/Words become a graph/,/Search in rings/,/Shortest route/,/Scale it up/]){
    await page.getByRole('tab',{name}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('button',{name:'Reuse a wildcard index'}).click();
  await expect(page.locator('#scale-explanation')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
