import {test} from 'node:test';
import assert from 'node:assert/strict';
import {edgeDirection} from '../src/path-motion.ts';
test('marching connectors follow the most recent traversal of repeated edges',()=>{
  assert.equal(edgeDirection('cat','cot',['cat','cot']),1);
  assert.equal(edgeDirection('cat','cot',['cat','cot','cat']),-1);
  assert.equal(edgeDirection('cat','cot',['cat','cot','cat','cot']),1);
  assert.equal(edgeDirection('cat','dog',['cat','cot']),0);
});
