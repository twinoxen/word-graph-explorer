import {test} from 'node:test';import assert from 'node:assert/strict';
import {WORDS,PUZZLES} from '../src/data.ts';
import {validateMove,shortestPath} from '../src/engine.ts';

test('the reported COLD to MOLD to MOOD ladder accepts each real word',()=>{
  const route=['cold','mold','mood','wood','word','ward','warm'];
  for(let i=1;i<route.length;i++)assert.equal(validateMove(route[i-1],route[i],WORDS),null,`${route[i-1]} to ${route[i]}`);
});
test('common omitted word families can form legal ladders',()=>{
  for(const route of [['mood','moon','noon','soon'],['book','cook','hook','look'],['back','pack','puck','luck'],['cat','fat','fan','fun'],['word','wore','ware','care']]){
    for(let i=1;i<route.length;i++)assert.equal(validateMove(route[i-1],route[i],WORDS),null,`${route[i-1]} to ${route[i]}`);
  }
});
test('bundled vocabulary is unique lowercase alphabetic words of supported lengths',()=>{
  assert.equal(WORDS.length,new Set(WORDS).size);
  for(const word of WORDS)assert.match(word,/^[a-z]{3,4}$/);
  for(const puzzle of PUZZLES)assert.ok(shortestPath(puzzle.start,puzzle.goal,WORDS));
  assert.ok(validateMove('mold','mooo',WORDS));
});
