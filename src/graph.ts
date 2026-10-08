import p5 from 'p5';
import {adjacent,component,type Snapshot} from './engine';
export interface GraphState {start:string;goal:string;words:string[];player:string[];solution:string[];snapshot:Snapshot;selected:string|null}
export function mountGraph(host:HTMLElement,getState:()=>GraphState,onSelect:(word:string)=>void){
  let positions=new Map<string,{x:number;y:number}>();
  const sketch=new p5(p=>{
    p.setup=()=>{const canvas=p.createCanvas(Math.max(host.clientWidth,600),620);canvas.attribute('aria-label','Word graph. Use the game and search panels for the text equivalent.');p.textFont('monospace');p.frameRate(20);};
    p.draw=()=>{
      const state=getState(),all=component(state.start,state.words),depth=new Map([[state.start,0]]);
      for(const word of all)for(const next of all)if(!depth.has(next)&&adjacent(word,next))depth.set(next,depth.get(word)!+1);
      const visible=all;
      const groups=new Map<number,string[]>();for(const word of visible){const d=depth.get(word)!;groups.set(d,[...(groups.get(d)||[]),word]);}
      const width=Math.max(host.clientWidth,600,(Math.max(...groups.keys())+1)*125+65),height=Math.max(620,...[...groups.values()].map(g=>g.length*42+90));
      if(p.width!==width||p.height!==height)p.resizeCanvas(width,height);
      p.background('#121b2b');positions=new Map();
      for(const [d,group] of groups){p.noStroke();p.fill('#62718b');p.textAlign(p.CENTER,p.CENTER);p.textSize(10);p.text(`DEPTH ${d}`,55+d*125,27);group.forEach((word,i)=>positions.set(word,{x:55+d*125,y:65+i*42}));}
      const pathEdge=(a:string,b:string,path:string[])=>path.some((w,i)=>i>0&&((path[i-1]===a&&w===b)||(path[i-1]===b&&w===a)));
      for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++)if(adjacent(visible[i],visible[j])){
        const a=positions.get(visible[i])!,b=positions.get(visible[j])!;const player=pathEdge(visible[i],visible[j],state.player),optimal=pathEdge(visible[i],visible[j],state.solution);
        p.stroke(optimal?'#f5c36a':player?'#65dfb5':'#29364b');p.strokeWeight(optimal&&player?6:optimal||player?3:1);p.line(a.x,a.y,b.x,b.y);
        if(optimal&&player){p.stroke('#65dfb5');p.strokeWeight(2);p.line(a.x,a.y,b.x,b.y);}
      }
      for(const word of visible){const pos=positions.get(word)!;let fill='#1a263b',stroke='#3d4c64',color='#aebbd1';
        if(state.snapshot.visited.includes(word)){fill='#25374e';color='#e1e9f4';}
        if(state.snapshot.queue.includes(word)){fill='#303052';stroke='#a99df4';color='#d1cafa';}
        if(state.player.includes(word)){fill='#143a36';stroke='#65dfb5';color='#9bf4d2';}
        if(state.solution.includes(word)){fill=state.player.includes(word)?'#143a36':'#443724';stroke='#f5c36a';color=state.player.includes(word)?'#9bf4d2':'#ffda94';}
        if(state.snapshot.current===word||state.selected===word){stroke='#ffffff';p.strokeWeight(3);}else p.strokeWeight(1.5);
        p.fill(fill);p.stroke(stroke);p.rectMode(p.CENTER);p.rect(pos.x,pos.y,64,28,9);p.noStroke();p.fill(color);p.textSize(12);p.textAlign(p.CENTER,p.CENTER);p.text(word.toUpperCase(),pos.x,pos.y);
        if(word===state.start||word===state.goal){p.fill('#8495af');p.textSize(8);p.text(word===state.goal?'GOAL':'START',pos.x,pos.y+21);}
      }
      host.dataset.count=`Showing ${visible.length} of ${all.length} connected words. Scroll to explore. All words in the selected connected component are shown.`;
    };
    p.mouseClicked=()=>{for(const [word,pos]of positions)if(Math.abs(p.mouseX-pos.x)<32&&Math.abs(p.mouseY-pos.y)<14){onSelect(word);break;}};
  },host);
  const observer=new ResizeObserver(()=>sketch.redraw());observer.observe(host);
  return ()=>{observer.disconnect();sketch.remove();};
}
