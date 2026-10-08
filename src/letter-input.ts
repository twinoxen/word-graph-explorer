export const letterInputMarkup=`<div id="word-entry" class="word-entry"><input id="next" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="3" aria-describedby="entry-instructions message"><div id="letter-slots" class="word-tiles" aria-hidden="true"></div></div>`;

export function mountLetterInput(input:HTMLInputElement,slots:HTMLElement){
  let length=3;
  function sync(){
    const focused=document.activeElement===input;
    const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
    const active=Math.min(start,length-1);
    Array.from(slots.children).forEach((tile,index)=>{
      tile.textContent=input.value[index]?.toUpperCase()||'';
      tile.classList.toggle('filled',index<input.value.length);
      tile.classList.toggle('active-letter',focused&&start===end&&index===active);
      tile.classList.toggle('selected-letter',focused&&start!==end&&index>=start&&index<end);
    });
  }
  function setLength(nextLength:number){
    length=nextLength;input.maxLength=length;
    slots.closest<HTMLElement>('.ladder-column')!.style.setProperty('--word-length',String(length));
    slots.replaceChildren(...Array.from({length},()=>{const tile=document.createElement('span');tile.className='letter-tile';return tile;}));
    sync();
  }
  input.addEventListener('click',event=>{
    if(event.shiftKey)return;
    const index=Array.from(slots.children).findIndex(tile=>{const bounds=tile.getBoundingClientRect();return event.clientX>=bounds.left&&event.clientX<=bounds.right;});
    if(index>=0){const start=Math.min(index,input.value.length);input.setSelectionRange(start,Math.min(start+1,input.value.length));}
    sync();
  });
  input.addEventListener('paste',event=>{
    const pasted=event.clipboardData?.getData('text');
    if(pasted===undefined||pasted===pasted.trim())return;
    event.preventDefault();
    const start=input.selectionStart??0,end=input.selectionEnd??start;
    const remaining=length-(input.value.length-(end-start));
    input.setRangeText(pasted.trim().slice(0,remaining),start,end,'end');
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  for(const event of ['input','focus','blur','keyup','select'])input.addEventListener(event,sync);
  document.addEventListener('selectionchange',()=>{if(document.activeElement===input)sync();});
  setLength(length);
  return {sync,setLength};
}
