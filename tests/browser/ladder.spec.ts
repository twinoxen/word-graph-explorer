import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');});

test('the seed and accepted words form aligned rungs above a fresh tiled input',async({page})=>{
  await expect(page.locator('#ladder li .letter-tile')).toHaveText(['C','A','T']);
  await expect(page.locator('#letter-slots .letter-tile')).toHaveCount(3);
  await page.locator('#next').pressSequentially('cot');
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['C','O','T']);
  await page.locator('#next').press('Enter');
  await expect(page.locator('#ladder li')).toHaveCount(2);
  await expect(page.locator('#ladder li').last().locator('.letter-tile')).toHaveText(['C','O','T']);
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['','','']);
  await expect(page.locator('#next')).toBeFocused();
  const seed=await page.locator('#ladder li').first().boundingBox();
  const rung=await page.locator('#ladder li').last().boundingBox();
  const input=await page.locator('#letter-slots').boundingBox();
  expect(seed!.y+seed!.height).toBeLessThanOrEqual(rung!.y);
  expect(rung!.y+rung!.height).toBeLessThanOrEqual(input!.y);
  const accepted=await page.locator('#ladder li').last().locator('.letter-tile').first().boundingBox();
  const empty=await page.locator('#letter-slots .letter-tile').first().boundingBox();
  expect(accepted!.x).toBeCloseTo(empty!.x,0);
});

test('clicking a letter tile selects it for replacement and deletion remains native',async({page})=>{
  await page.locator('#next').fill('cat');
  await page.locator('#letter-slots').scrollIntoViewIfNeeded();
  const middle=await page.locator('#letter-slots .letter-tile').nth(1).boundingBox();
  await page.mouse.click(middle!.x+middle!.width/2,middle!.y+middle!.height/2);
  await page.keyboard.type('o');
  await expect(page.locator('#next')).toHaveValue('cot');
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['C','O','T']);
  await page.locator('#next').press('End');await page.locator('#next').press('Backspace');
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['C','O','']);
  await page.locator('#next').pressSequentially('g');
  await expect(page.locator('#next')).toHaveValue('cog');
});

test('an invalid word stays in its squares and never creates a rung',async({page})=>{
  await page.locator('#next').fill('dog');await page.locator('#next').press('Enter');
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['D','O','G']);
  await expect(page.locator('#ladder li')).toHaveCount(1);
  await expect(page.locator('#next')).toHaveAttribute('aria-invalid','true');
  await page.locator('#next').fill('cot');await page.locator('#submit-move').click();
  await expect(page.locator('#ladder li')).toHaveCount(2);
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['','','']);
});

test('switching puzzle length rebuilds the squares and undo preserves the current draft',async({page})=>{
  await page.locator('#puzzle').selectOption('1');
  await expect(page.locator('#letter-slots .letter-tile')).toHaveCount(4);
  await expect(page.locator('#ladder li .letter-tile')).toHaveText(['C','O','L','D']);
  await page.locator('#next').fill('cord');await page.locator('#next').press('Enter');
  await page.locator('#next').fill('card');await page.locator('#undo').click();
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['C','A','R','D']);
  await expect(page.locator('#ladder li')).toHaveCount(1);
  await page.locator('#restart').click();
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['','','','']);
});

test('a long ladder scrolls to its latest rung while mobile tiles stay aligned',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const word of ['cot','cat','cot','cat','cot','cat','cot']){
    await page.locator('#next').fill(word);await page.locator('#next').press('Enter');
  }
  await expect(page.locator('#ladder li').last()).toBeInViewport();
  const viewport=page.locator('#ladder');
  expect(await viewport.evaluate(el=>el.scrollTop>0)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#puzzle').selectOption('1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const seed=await page.locator('#ladder .letter-tile').first().boundingBox();
  const input=await page.locator('#letter-slots .letter-tile').first().boundingBox();
  expect(seed!.x).toBeCloseTo(input!.x,0);
});

 test('pasting a padded word keeps all of its letters',async({page})=>{
  await page.locator('#next').focus();
  await page.locator('#next').evaluate(input=>{
    const clipboardData=new DataTransfer();clipboardData.setData('text',' COT ');
    input.dispatchEvent(new ClipboardEvent('paste',{clipboardData,bubbles:true,cancelable:true}));
  });
  await expect(page.locator('#letter-slots .letter-tile')).toHaveText(['C','O','T']);
  await page.locator('#next').press('Enter');
  await expect(page.locator('#ladder li')).toHaveCount(2);
});

test('the reported MOLD to MOOD move creates a rung instead of a vocabulary error',async({page})=>{
  await page.locator('#puzzle').selectOption('1');
  for(const word of ['mold','mood']){
    await page.locator('#next').fill(word);await page.locator('#next').press('Enter');
  }
  await expect(page.locator('#ladder li')).toHaveCount(3);
  await expect(page.locator('#ladder li').last().locator('.letter-tile')).toHaveText(['M','O','O','D']);
  await expect(page.locator('#next')).toHaveValue('');
  await expect(page.locator('#message')).not.toContainText('not in this curated vocabulary');
});
