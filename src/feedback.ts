export type Tone = 'info'|'error'|'success'|'hint';
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function createFeedback(message:HTMLElement,input:HTMLInputElement,form:HTMLElement,toast:HTMLElement,confetti:HTMLElement){
  let toastTimer:ReturnType<typeof setTimeout>|undefined,confettiTimer:ReturnType<typeof setTimeout>|undefined;
  function clear(){clearTimeout(toastTimer);clearTimeout(confettiTimer);toast.hidden=true;confetti.replaceChildren();form.classList.remove('shake');input.setAttribute('aria-invalid','false');}
  function show(text:string,tone:Tone='info',notify=false){
    message.textContent=text;message.dataset.tone=tone;
    if(!notify){clearTimeout(toastTimer);toast.hidden=true;}
    input.setAttribute('aria-invalid',String(tone==='error'));
    if(notify){clearTimeout(toastTimer);toast.textContent=(tone==='error'?'⚠ ':tone==='success'?'✓ ':'✧ ')+text;toast.dataset.tone=tone;toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,4500);}
  }
  function reject(text:string){show(text,'error',true);form.classList.remove('shake');void form.offsetWidth;form.classList.add('shake');input.focus();}
  function celebrate(){
    clearTimeout(confettiTimer);confetti.replaceChildren();
    if(reducedMotion())return;
    for(let i=0;i<48;i++){const piece=document.createElement('i');piece.style.setProperty('--x',`${Math.random()*100}vw`);piece.style.setProperty('--drift',`${Math.random()*180-90}px`);piece.style.setProperty('--delay',`${Math.random()*.35}s`);piece.style.setProperty('--spin',`${Math.random()*720-360}deg`);piece.style.background=['#65dfb5','#f5c36a','#a99df4','#edf7ff'][i%4];confetti.append(piece);}
    confettiTimer=setTimeout(()=>confetti.replaceChildren(),2600);
  }
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(reducedMotion())confetti.replaceChildren();});
  return {show,reject,celebrate,clear};
}
