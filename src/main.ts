import './style.css';
import {WORDS,PUZZLES} from './data';
import {adjacent,normalize,search,shortestPath,validateMove,type SearchResult} from './engine';
import {createFeedback,type Tone} from './feedback';
import {lessonMarkup,mountLessons} from './lessons';
import {letterInputMarkup,mountLetterInput} from './letter-input';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<header><a class="brand" href="./"><span class="brand-icon">w.</span> word graph <b>explorer</b></a><nav aria-label="Main"><a href="#game">Play</a><a href="#search-lab">Connections</a><a href="#learn">Explore the ideas</a><a href="https://github.com/twinoxen/word-graph-explorer" target="_blank" rel="noreferrer">Source ↗</a></nav></header>
<main><div class="intro"><div><span class="eyebrow">A SMALL WORD GAME WITH BIG POSSIBILITIES</span><h1>One letter opens<br><span>new possibilities.</span></h1><p>Turn one word into another, one letter at a time.<br>Find a way through. Then see if you can find a shorter one.</p></div><div class="hero-art" aria-hidden="true"><span class="hero-word">PLA<span>Y</span></span><i>↓</i><span class="hero-word middle">PLA<span>N</span></span><i>↓</i><span class="hero-word last"><span>C</span>LAN</span><small>SMALL CHANGES REVEAL SURPRISING CONNECTIONS.</small></div></div>
<section id="game" class="panel game" aria-labelledby="game-title"><div class="panel-heading"><h2 id="game-title"><i class="dot green"></i> Make the connection.</h2><span class="game-label">WORD LADDER</span></div><div class="game-layout"><div class="challenge-column">
<label class="field-label" for="puzzle">Choose a challenge</label><select id="puzzle">${PUZZLES.map((p,i)=>`<option value="${i}">${p.label} · ${p.difficulty}</option>`).join('')}<option value="custom">Custom words</option></select>
<form id="custom" hidden><div class="custom-fields"><label>Start<input id="custom-start" maxlength="4" placeholder="COLD" required></label><label>Goal<input id="custom-goal" maxlength="4" placeholder="WARM" required></label></div><button class="secondary">Set puzzle</button><p id="custom-error" role="status"></p></form>
<div class="endpoints"><div><span class="field-label">START</span><strong id="start"></strong></div><span class="endpoint-arrow">→</span><div><span class="field-label">GOAL</span><strong id="goal"></strong></div></div>
<p class="mobile-rule">Change one letter. Every step must be a word in our vocabulary.</p><div class="tip"><span>HOW TO PLAY</span><p>Change <b>exactly one letter</b> each turn. Keep the word length the same. Every step must be in our curated vocabulary.</p></div><div class="challenge-footnote">A real word may be missing because this teaching dictionary includes only selected English words.</div></div><div class="ladder-column"><div class="row"><h2>Your ladder</h2><span id="moves" class="muted"></span></div><ol id="ladder"></ol>
<form id="move-form"><label class="field-label" for="next">Your next word</label><div class="input-row">${letterInputMarkup}<button id="submit-move" class="primary" aria-label="Submit word">Connect →</button></div><p id="entry-instructions" class="entry-instructions">Type a letter in each square, and press Enter to submit.</p></form><p id="message" class="message" role="status" aria-live="polite"></p>
<section id="victory" class="victory" hidden role="status"><span class="victory-icon" aria-hidden="true">✦</span><h2>Ladder complete!</h2><p id="victory-text"></p><button id="next-challenge" class="primary">Next challenge →</button></section>
<div class="actions"><button id="hint" class="secondary">✧ Next-word hint</button><button id="reveal" class="secondary">Reveal shortest path</button></div><div id="answer" hidden class="answer"></div><div class="small-actions"><button id="undo">← Undo move</button><button id="restart">↻ Start over</button></div>
</div></div><div class="game-bottom"><span><i class="dot green"></i> Every move opens a possibility.</span><a href="#learn">Curious how it works? Explore below ↓</a></div></section>
<section id="search-lab" class="panel visualization" aria-labelledby="lab-title"><div class="panel-heading"><span><i class="dot purple"></i> THE CONNECTIONS</span><span class="muted">02</span></div><div class="row graph-heading"><div><h2 id="lab-title">Explore the connections in your puzzle.</h2><p class="muted">Your ladder and the search algorithm share this map. Every line connects words that differ by exactly one letter.</p></div><span class="badge">BREADTH-FIRST SEARCH</span></div>
<div class="legend"><span><i class="dot green"></i>Your path</span><span><i class="dot amber"></i>Shortest path</span><span><i class="dot purple"></i>Queued</span><span><i class="dot blue"></i>Explored</span></div><div id="graph" class="graph"></div><p id="graph-note" class="graph-note"></p><button id="retry-graph" class="secondary" hidden>Retry loading the map</button>
<div class="search-controls"><button id="play" class="primary">▶ Play BFS</button><button id="step" class="secondary">Step →</button><button id="reset-search" class="secondary" aria-label="Reset BFS">↻ Reset</button><label class="speed">Speed <select id="speed"><option value="1000">Slow</option><option value="450" selected>Normal</option><option value="100">Fast</option></select></label></div>
<div class="stats"><div><span>CURRENT WORD</span><strong id="current">—</strong></div><div><span>EXPLORED</span><strong id="visited">0</strong></div><div><span>DEPTH</span><strong id="depth">0</strong></div></div><div class="queue"><span class="field-label">FIFO QUEUE</span><div id="queue"></div></div><p id="search-message" class="search-message" aria-live="polite"></p><p id="inspector" class="muted">Click a word to inspect its neighbors.</p></section>
${lessonMarkup}
<footer><span>You can play, explore, and follow your curiosity.</span><span>This open source game uses a curated vocabulary and requires no account.</span></footer></main><div id="toast" class="toast" role="status" aria-live="polite" hidden></div><div id="confetti" class="confetti" aria-hidden="true"></div>`;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
let start='cat',goal='dog',player=[start],solution:string[]=[],result:SearchResult=search(start,goal,WORDS),index=0,timer:ReturnType<typeof setInterval>|null=null,selected:string|null=null;
function pause(){if(timer!==null)clearInterval(timer);timer=null;el('play').textContent='▶ Play BFS';}
const lessons=mountLessons(()=>({start,goal,player,path:result.path}));
const letterInput=mountLetterInput(el<HTMLInputElement>('next'),el('letter-slots'));
const feedback=createFeedback(el('message'),el<HTMLInputElement>('next'),el('move-form'),el('toast'),el('confetti'));
function message(text:string,tone:Tone='info',notify=false){feedback.show(text,tone,notify);}
function render(){
  el('start').textContent=start.toUpperCase();el('goal').textContent=goal.toUpperCase();el('moves').textContent=`${player.length-1} moves`;
  el('ladder').replaceChildren(...player.map((word,i)=>{
    const li=document.createElement('li');li.className='ladder-rung';li.setAttribute('aria-label',`Step ${i}: ${word.toUpperCase()}${i===player.length-1?', current word':''}`);
    const count=document.createElement('span');count.className='rung-number';count.setAttribute('aria-hidden','true');count.textContent=String(i).padStart(2,'0');
    const tiles=document.createElement('div');tiles.className='word-tiles';tiles.setAttribute('aria-hidden','true');
    tiles.replaceChildren(...[...word].map(letter=>{const tile=document.createElement('span');tile.className='letter-tile';tile.textContent=letter.toUpperCase();return tile;}));
    li.append(count,tiles);
    if(i===player.length-1){const tag=document.createElement('em');tag.className='rung-status';tag.setAttribute('aria-hidden','true');tag.textContent=word===goal?'GOAL':i===0?'SEED':'CURRENT';li.append(tag);}
    return li;
  }));
  const won=player.at(-1)===goal;el('victory').hidden=!won;el('app').classList.toggle('won',won);(el('submit-move')as HTMLButtonElement).disabled=won;
  if(won){const moves=player.length-1,minimum=result.path?result.path.length-1:null;el('victory-text').textContent=`You connected ${start.toUpperCase()} to ${goal.toUpperCase()} in ${moves} moves. ${moves===minimum?'A shortest path — beautifully done!':`The shortest path takes ${minimum} moves. Try again and see how close you can get!`}`;}
  (el('next') as HTMLInputElement).disabled=won;letterInput.sync();(el('hint')as HTMLButtonElement).disabled=won;(el('undo')as HTMLButtonElement).disabled=player.length===1;
  const snap=result.snapshots[index];el('current').textContent=snap.current?.toUpperCase()||'—';el('visited').textContent=String(snap.visited.length);el('depth').textContent=String(snap.depth);
  el('queue').replaceChildren(...snap.queue.map(w=>{const chip=document.createElement('code');chip.textContent=w.toUpperCase();return chip;}));if(!snap.queue.length)el('queue').textContent='Queue empty';
  (el('step')as HTMLButtonElement).disabled=snap.done;(el('play')as HTMLButtonElement).disabled=snap.done;
  el('search-message').textContent=snap.done?(result.path?`Goal reached in ${result.path.length-1} moves. Follow the gold route.`:'Search complete: no route exists in this vocabulary.'):index===0?'Ready when you are. Play or step to explore the graph.':`Explore ${snap.current?.toUpperCase()}: add unseen neighbors to the back of the queue.`;
  el('graph-note').textContent=el('graph').dataset.count||'Nearby words are shown. Scroll to explore the graph.';
}
function resetSearch(){pause();result=search(start,goal,WORDS);index=0;solution=[];el('answer').hidden=true;render();}
function newPuzzle(a:string,b:string){lessons.puzzleChanged();el('inspector').textContent='Click a word to inspect its neighbors.';feedback.clear();el<HTMLInputElement>('next').value='';letterInput.setLength(a.length);pause();start=a;goal=b;player=[start];selected=null;resetSearch();message(start===goal?'Already at the goal — zero moves needed.':'Your first move is waiting.');if(start===goal)(el('next')as HTMLInputElement).disabled=true;}
function step(){if(index<result.snapshots.length-1)index++;if(result.snapshots[index].done){pause();solution=result.path||[];}render();}
el('next').addEventListener('input',()=>{
  const input=el<HTMLInputElement>('next');
  if(!input.value.trim()){message('Change one letter to make your next connection.');return;}
  if(input.value.length<start.length){message(`Fill all ${start.length} squares to complete your next word.`);return;}
  const error=validateMove(player.at(-1)!,input.value,WORDS);
  message(error||'Valid word — press Enter to connect. ',error?'error':'success');
});
el('move-form').addEventListener('submit',event=>{
  event.preventDefault();if(player.at(-1)===goal)return;
  const input=el<HTMLInputElement>('next'),error=validateMove(player.at(-1)!,input.value,WORDS);
  if(error){feedback.reject(error);return;}
  lessons.playerChanged();const previous=player.at(-1)!;player.push(normalize(input.value));input.value='';
  const won=player.at(-1)===goal;
  message(won?`Ladder complete! You reached ${goal.toUpperCase()} in ${player.length-1} moves.`:`${previous.toUpperCase()} → ${player.at(-1)!.toUpperCase()} — connected!`, 'success',won);
  render();el('ladder').lastElementChild?.classList.add('rung-enter');el('ladder').scrollTop=el('ladder').scrollHeight;
  if(!won){input.focus({preventScroll:true});input.setSelectionRange(0,0);letterInput.sync();input.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  if(won){feedback.celebrate();el('victory').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
el('hint').onclick=()=>{const path=shortestPath(player.at(-1)!,goal,WORDS);message(path&&path.length>1?`Try ${path[1].toUpperCase()} — ${path.length-1} moves remain on a shortest route.`:'No route to the goal from here in this vocabulary.','hint',true);};
el('reveal').onclick=()=>{solution=result.path||[];el('answer').hidden=false;el('answer').textContent=result.path?`${result.path.map(w=>w.toUpperCase()).join(' → ')} · ${result.path.length-1} moves`:'No route exists in this vocabulary.';render();};
el('undo').onclick=()=>{lessons.playerChanged();feedback.clear();if(player.length>1)player.pop();message('Move undone. Try another connection.');render();};
el('restart').onclick=()=>newPuzzle(start,goal);
el('next-challenge').onclick=()=>{const current=PUZZLES.findIndex(p=>p.start===start&&p.goal===goal),next=PUZZLES[(current+1)%PUZZLES.length];el<HTMLSelectElement>('puzzle').value=String((current+1)%PUZZLES.length);el('custom').hidden=true;newPuzzle(next.start,next.goal);};
el('puzzle').addEventListener('change',()=>{const value=el<HTMLSelectElement>('puzzle').value;el('custom').hidden=value!=='custom';if(value!=='custom'){const p=PUZZLES[Number(value)];newPuzzle(p.start,p.goal);}});
el('custom').addEventListener('submit',event=>{event.preventDefault();const a=normalize(el<HTMLInputElement>('custom-start').value),b=normalize(el<HTMLInputElement>('custom-goal').value);if(!WORDS.includes(a)||!WORDS.includes(b)||a.length!==b.length){el('custom-error').textContent='Choose two known words of the same length (3 or 4 letters).';return;}el('custom-error').textContent='';newPuzzle(a,b);if(!result.path)message('These words have no connecting route in this vocabulary. Choose another pair.');});
el('step').onclick=step;el('reset-search').onclick=resetSearch;
function play(){pause();if(result.snapshots[index].done)return;el('play').textContent='Ⅱ Pause';timer=setInterval(step,Number(el<HTMLSelectElement>('speed').value));}
el('play').onclick=()=>timer!==null?pause():play();el('speed').onchange=()=>{if(timer!==null)play();};
let graphLoaded=false;
async function loadGraph(){
  if(graphLoaded)return;
  graphLoaded=true;
  try{
    const {mountGraph}=await import('./graph');
    mountGraph(el('graph'),()=>({start,goal,words:WORDS.filter(w=>w.length===start.length),player,solution,snapshot:result.snapshots[index],selected}),word=>{selected=word;const neighbors=WORDS.filter(w=>adjacent(word,w));el('inspector').textContent=`${word.toUpperCase()} connects to: ${neighbors.map(w=>w.toUpperCase()).join(', ')}.`;});
  }catch{graphLoaded=false;el('graph-note').textContent='The graph could not load. You can retry or inspect the search using the queue and text controls.';el('retry-graph').hidden=false;}
}
newPuzzle(start,goal);

el('retry-graph').onclick=()=>{el('retry-graph').hidden=true;void loadGraph();};
const mapObserver=new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting)){void loadGraph();mapObserver.disconnect();}
},{rootMargin:'100px'});
mapObserver.observe(el('graph'));
