import {test} from 'node:test';import assert from 'node:assert/strict';
import {bfsTrace,dfsRoute,teachingSearch,neighbors} from '../src/lesson-model.ts';
import {adjacent} from '../src/engine.ts';

test('teaching trace preserves discovery, queue uniqueness, parent distance and real solver route',()=>{
  const trace=bfsTrace();
  assert.equal(trace.at(-1)?.action,'goal');assert.equal(new Map(trace.at(-1)!.distances).get('dog'),3);
  for(const frame of trace){
    assert.equal(new Set(frame.queue).size,frame.queue.length);
    for(const queued of frame.queue)assert.ok(frame.discovered.includes(queued));
    const depths=new Map(frame.distances);
    for(const [child,parent] of frame.parents){assert.ok(adjacent(child,parent));assert.equal(depths.get(child),depths.get(parent)!+1);}
    const ordered=frame.queue.map(w=>depths.get(w)!);assert.deepEqual(ordered,[...ordered].sort((a,b)=>a-b));
  }
  const parents=new Map(trace.at(-1)!.parents);const route=['dog'];while(route[0]!=='cat')route.unshift(parents.get(route[0])!);
  assert.deepEqual(route,teachingSearch.path);
});
test('DFS counterexample is legal but longer than BFS on the same dictionary',()=>{
  const dfs=dfsRoute()!;assert.ok(dfs.length>teachingSearch.path!.length);
  for(let i=1;i<dfs.length;i++)assert.ok(adjacent(dfs[i-1],dfs[i]));
  assert.deepEqual(neighbors('sun'),[]);
});
test('teaching search handles identical endpoints and a disconnected goal',()=>{
  assert.equal(bfsTrace('cat','cat').at(-1)!.action,'goal');
  const trace=bfsTrace('cat','sun');assert.equal(trace.at(-1)!.action,'unreachable');assert.deepEqual(trace.at(-1)!.queue,[]);
});
