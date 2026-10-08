export const normalize = (word: string) => word.trim().toLowerCase();
export function adjacent(a: string,b: string): boolean {
  if(a.length!==b.length)return false;
  let difference=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])difference++;
  return difference===1;
}
export function validateMove(current: string,input: string,words: readonly string[]): string|null {
  const next=normalize(input);
  if(next.length!==current.length)return `Use a ${current.length}-letter word.`;
  if(next===current)return 'Change one letter to make a new word.';
  if(!adjacent(current,next))return 'Change exactly one letter.';
  if(!words.includes(next))return 'That word is not in this curated vocabulary.';
  return null;
}
export interface Snapshot {current:string|null;queue:string[];visited:string[];depth:number;done:boolean}
export interface SearchResult {path:string[]|null;snapshots:Snapshot[];depths:Map<string,number>}
export function search(start:string,goal:string,words:readonly string[]):SearchResult {
  const vocabulary=[...new Set(words)].filter(w=>w.length===start.length).sort();
  const queue=[start],visited=new Set([start]),parents=new Map<string,string>(),depths=new Map([[start,0]]);
  const snapshots:Snapshot[]=[{current:null,queue:[start],visited:[],depth:0,done:false}];
  if(!vocabulary.includes(start)||!vocabulary.includes(goal))return {path:null,snapshots:[],depths:new Map()};
  const explored:string[]=[];let path:string[]|null=null;
  for(let head=0;head<queue.length;head++){
    const current=queue[head];explored.push(current);
    if(current===goal){path=[goal];while(path[0]!==start)path.unshift(parents.get(path[0])!);snapshots.push({current,queue:queue.slice(head+1),visited:[...explored],depth:depths.get(current)!,done:true});break;}
    for(const next of vocabulary){if(!visited.has(next)&&adjacent(current,next)){visited.add(next);parents.set(next,current);depths.set(next,depths.get(current)!+1);queue.push(next);}}
    snapshots.push({current,queue:queue.slice(head+1),visited:[...explored],depth:depths.get(current)!,done:head===queue.length-1});
  }
  return {path,snapshots,depths};
}
export const shortestPath=(start:string,goal:string,words:readonly string[])=>search(start,goal,words).path;
export function component(start:string,words:readonly string[]):string[]{
  const found=[start],seen=new Set(found);
  for(let i=0;i<found.length;i++)for(const word of words)if(!seen.has(word)&&adjacent(found[i],word)){seen.add(word);found.push(word);}
  return found;
}
