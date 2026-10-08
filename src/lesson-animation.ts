interface AnimationOptions {
  prefix:string;
  frames:number;
  render:(frame:number)=>void;
}

export function mountLessonAnimation(options:AnimationOptions){
  const stage=document.getElementById(`${options.prefix}-stage`)!;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,visible=false,timer:ReturnType<typeof setInterval>|null=null;
  function draw(){options.render(frame);stage.dataset.frame=String(frame);stage.dataset.playing=String(timer!==null);}
  function pause(){if(timer!==null)clearInterval(timer);timer=null;draw();}
  function restart(){
    pause();frame=motion.matches?options.frames-1:0;
    if(visible&&!document.hidden&&!stage.closest('[hidden]')&&!motion.matches){
      timer=setInterval(()=>{frame++;if(frame===options.frames-1){clearInterval(timer!);timer=null;}draw();},1200);
    }
    draw();
  }
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible)restart();else pause();
  },{threshold:0.15}).observe(stage);
  motion.addEventListener('change',restart);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else restart();});
  draw();
  return {pause,restart};
}
