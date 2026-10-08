// The latest traversal determines flow when a player revisits an edge.
export function edgeDirection(a:string,b:string,path:readonly string[]): -1|0|1 {
  for(let i=path.length-1;i>0;i--){
    if(path[i-1]===a&&path[i]===b)return 1;
    if(path[i-1]===b&&path[i]===a)return -1;
  }
  return 0;
}
