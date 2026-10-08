interface AnimationOptions {
  prefix:string;
  frames:number;
  render:(frame:number)=>void;
  enabled?:()=>boolean;
  nextId?:string;
  resetId?:string;
}

export function mountLessonAnimation(options:AnimationOptions){
  const find=(id:string)=>document.getElementById(id)!;
  const stage=find(`${options.prefix}-stage`);
  const play=find(`${options.prefix}-animate`) as HTMLButtonElement;
  const next=find(options.nextId||`${options.prefix}-next`) as HTMLButtonElement;
  const reset=find(options.resetId||`${options.prefix}-replay`);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,timer:ReturnType<typeof setInterval>|null=null;
  function controls(){
    const enabled=options.enabled?.()??true;
    play.disabled=!enabled;
    play.textContent=timer?'Pause animation':motion.matches?'Show final step':'Play animation';
    next.disabled=!enabled||frame===options.frames-1;
    stage.dataset.frame=String(frame);
    stage.dataset.playing=String(timer!==null);
  }
  function pause(){if(timer!==null)clearInterval(timer);timer=null;controls();}
  function draw(){options.render(frame);controls();}
  function advance(){if(frame<options.frames-1)frame++;if(frame===options.frames-1)pause();draw();}
  function restart(){pause();frame=0;draw();}
  play.onclick=()=>{
    if(!(options.enabled?.()??true))return;
    if(timer!==null){pause();return;}
    if(motion.matches){frame=options.frames-1;draw();return;}
    if(frame===options.frames-1)frame=0;
    timer=setInterval(advance,1200);advance();
  };
  next.onclick=()=>{if(!(options.enabled?.()??true))return;pause();advance();};
  reset.onclick=restart;
  motion.addEventListener('change',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  draw();
  return {pause,restart,refresh:controls};
}

export function animationControls(prefix:string){
  return `<div class="animation-controls"><button id="${prefix}-animate" class="primary">Play animation</button><button id="${prefix}-next" class="secondary">Next step</button><button id="${prefix}-replay" class="secondary">Start again</button></div>`;
}
