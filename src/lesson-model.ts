import {adjacent,search} from './engine.ts';

export const TEACHING_WORDS=['cat','bat','bad','bag','bog','cot','cog','dot','dog','sun'];
export const neighbors=(word:string)=>TEACHING_WORDS.filter(next=>adjacent(word,next)).sort();
export interface SearchFrame {
  action:'initialize'|'dequeue'|'discover'|'skip'|'goal'|'unreachable';
  current:string|null;candidate:string|null;queue:string[];discovered:string[];
  parents:[string,string][];distances:[string,number][];line:number;caption:string;
}
export function bfsTrace(start='cat',goal='dog'):SearchFrame[]{
  const queue=[start],seen=new Set([start]),parents=new Map<string,string>(),distances=new Map([[start,0]]);
  const frames:SearchFrame[]=[];
  const save=(action:SearchFrame['action'],current:string|null,candidate:string|null,line:number,caption:string)=>frames.push({action,current,candidate,line,caption,queue:[...queue],discovered:[...seen],parents:[...parents],distances:[...distances]});
  save('initialize',null,null,0,`The search starts with ${start.toUpperCase()} in the queue and marks it discovered at distance zero.`);
  while(queue.length){
    const current=queue.shift()!;
    save('dequeue',current,null,2,`The search removes ${current.toUpperCase()} from the front of the queue at distance ${distances.get(current)}.`);
    if(current===goal){save('goal',current,null,3,`The goal ${goal.toUpperCase()} has been reached at distance ${distances.get(current)}. Its recorded parents recover a shortest route.`);return frames;}
    for(const candidate of neighbors(current)){
      if(seen.has(candidate)){
        save('skip',current,candidate,5,`${candidate.toUpperCase()} was already discovered, so the search skips it and preserves its first parent.`);continue;
      }
      seen.add(candidate);parents.set(candidate,current);distances.set(candidate,distances.get(current)!+1);queue.push(candidate);
      save('discover',current,candidate,6,`The search discovers ${candidate.toUpperCase()} from ${current.toUpperCase()}, records distance ${distances.get(candidate)}, and adds it to the back of the queue.`);
    }
  }
  save('unreachable',null,null,8,'The queue is empty, so no route reaches the goal in this vocabulary.');return frames;
}
export function dfsRoute(start='cat',goal='dog'):string[]|null{
  const seen=new Set<string>();
  function visit(word:string,path:string[]):string[]|null{
    seen.add(word);if(word===goal)return path;
    for(const next of neighbors(word)){if(seen.has(next))continue;const found=visit(next,[...path,next]);if(found)return found;}
    return null;
  }
  return visit(start,[start]);
}
export const teachingSearch=search('cat','dog',TEACHING_WORDS);
export const BFS_CODE=[
  'queue = [start]; discovered = {start}; parents = {}; distance[start] = 0;',
  'while (queue has pending words) {',
  '  current = dequeueFront(queue);',
  '  if (current === goal) return recover(parents, goal);',
  '  for (next of neighbors(current)) {',
  '    if (discovered.has(next)) continue;',
  '    discovered.add(next); parents[next] = current;',
  '    distance[next] = distance[current] + 1; enqueueBack(queue, next);',
  '  } // If the queue empties, return no route.',
  '}'
];
