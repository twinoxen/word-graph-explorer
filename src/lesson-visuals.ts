import {adjacent,validateMove} from './engine';
import {TEACHING_WORDS,neighbors,bfsTrace,dfsRoute,teachingSearch,BFS_CODE,type SearchFrame} from './lesson-model';
import type {Lesson} from './lesson-content';
export const escapeHtml=(text:string)=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const word=(value:string,active=false)=>`<span class="concept-word ${active?'is-active':''}">${escapeHtml(value.toUpperCase())}</span>`;
const route=(values:string[],count=values.length)=>values.slice(0,count).map(w=>word(w)).join('<span class="route-arrow" aria-hidden="true">→</span>');
const positions:Record<string,[number,number]>={cat:[65,90],bat:[65,170],bad:[65,250],bag:[65,330],bog:[205,330],cog:[205,250],cot:[205,90],dot:[345,90],dog:[345,250],sun:[345,330]};
function graph(highlight:string[]=[],edgeLimit=Infinity){
  let edge=0;
  const edges=TEACHING_WORDS.flatMap((a,i)=>TEACHING_WORDS.slice(i+1).filter(b=>adjacent(a,b)).map(b=>{
    const [x1,y1]=positions[a],[x2,y2]=positions[b];const shown=edge++<edgeLimit;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${shown?'':'edge-pending'}"/>`;
  })).join('');
  return `<svg class="concept-graph" viewBox="0 0 410 390" role="img" aria-label="The teaching graph connects CAT to DOG through several routes, includes cycles, and leaves SUN disconnected."><g class="concept-edges">${edges}</g>${TEACHING_WORDS.map(w=>{const [x,y]=positions[w];return `<g class="concept-node ${highlight.includes(w)?'is-active':''} ${w==='sun'?'isolated':''}" transform="translate(${x},${y})"><rect x="-28" y="-17" width="56" height="34" rx="8"/><text text-anchor="middle" dy="5">${w.toUpperCase()}</text></g>`;}).join('')}</svg>`;
}
function structures(frame:SearchFrame,highlight=''){
  const cells=[['Frontier',frame.queue.map(w=>w.toUpperCase()).join(' → ')||'The queue is empty.'],['Discovered',frame.discovered.map(w=>w.toUpperCase()).join(', ')],['Parents',frame.parents.map(([w,p])=>`${w.toUpperCase()} ← ${p.toUpperCase()}`).join('; ')||'The start has no parent.'],['Distances',frame.distances.map(([w,d])=>`${w.toUpperCase()}: ${d}`).join('; ')]];
  return `<dl class="structure-list">${cells.map(([name,value])=>`<div class="${name===highlight?'is-active':''}"><dt>${name}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
}
const traces=bfsTrace();
const compact=traces.filter(f=>['initialize','dequeue','discover','goal'].includes(f.action));

export function mountLessonVisual(lesson:Lesson,container:HTMLElement){
  const kind=lesson.visual;
  let candidate='cot',representation='list',caseName='route',validationEdited=false;
  let count=1000;
  const controls=kind==='validation'?`<label for="validation-word">Try a candidate after CAT.</label><input id="validation-word" value="COT" maxlength="5" autocomplete="off" spellcheck="false"><span id="validation-announcement" class="visually-hidden" role="status" aria-live="polite"></span>`
    :kind==='representation'?`<label for="representation">Choose the representation to inspect.</label><select id="representation"><option value="list">Adjacency list</option><option value="array">Vocabulary array</option><option value="set">Vocabulary set</option></select>`
    :kind==='index'?`<label for="dictionary-size">Choose a dictionary size to estimate full-scan work.</label><input id="dictionary-size" type="range" min="100" max="20000" step="100" value="1000"><output id="dictionary-count">1,000 words</output>`
    :kind==='recovery'?`<label for="solver-case">Choose the solver contract to inspect.</label><select id="solver-case"><option value="route">CAT to DOG</option><option value="same">CAT to CAT</option><option value="disconnected">CAT to SUN</option></select>`:'';
  container.innerHTML=`<span class="experiment-label">${lesson.summary}</span><div class="concept-controls">${controls}</div><div id="concept-body" class="concept-body"></div><p id="concept-caption" class="animation-caption"></p><p class="animation-replay-note">This walkthrough plays when visible. Selecting this lesson again replays it.</p>`;
  const body=container.querySelector<HTMLElement>('#concept-body')!,caption=container.querySelector<HTMLElement>('#concept-caption')!;
  const frameCounts:Record<Lesson['visual'],number>={requirements:3,validation:3,state:3,graph:5,representation:3,neighbors:TEACHING_WORDS.length,memory:4,index:5,comparison:dfsRoute()!.length,bfs:traces.length,invariant:compact.length,recovery:6};
  let latestFrame=0;
  function draw(frame:number){
    latestFrame=frame;
    if(kind==='validation'&&validationEdited)frame=2;
    let html='',text='';
    if(kind==='requirements'){
      const steps=[['Validate one move.','CAT → COT is legal.'],['Find a route.','A legal route can include a detour.'],['Minimize the moves.','CAT → COT → COG → DOG takes three moves.']];
      html=`<div class="requirement-cards">${steps.map(([heading,detail],i)=>`<div class="${i<=frame?'is-active':''}"><strong>${heading}</strong><p>${detail}</p></div>`).join('')}</div>`;
      text=['The validator answers a local question about one proposed transformation.','A reachability solver combines legal moves until it finds the goal or exhausts the search.','The shortest-path requirement compares complete routes by their number of edges.'][frame];
    }else if(kind==='validation'){
      const changed=Array.from({length:Math.max(3,candidate.length)},(_,i)=>`<div class="character-pair ${'cat'[i]!==candidate[i]&&frame>=1?'mismatch':''}"><span>${escapeHtml(('cat'[i]||'—').toUpperCase())}</span><span>${escapeHtml((candidate[i]||'—').toUpperCase())}</span></div>`).join('');
      const error=validateMove('cat',candidate,TEACHING_WORDS);
      html=`<div class="character-comparison">${changed}</div><p class="validation-result ${error?'invalid':'valid'}">${frame===2?escapeHtml(error||'This move is legal because every rule passes.'):'The comparison inspects matching character positions.'}</p>`;
      text=['The words must have equal lengths before positional differences can define a legal move.','The highlighted columns show characters that differ between the two words.','Vocabulary membership and exactly one mismatch must both pass.'][frame];
    }else if(kind==='state'){
      html=`<div class="state-path"><p>One player follows this history.</p>${route(['cat','cot'])}<p>Another player follows this history.</p>${route(['cat','bat','bad','bag','bog','cog','cot'])}<div class="state-merge ${frame>=1?'is-active':''}"><strong>Both players are now at COT.</strong><p>${frame>=2?'Both have the same legal next words: CAT, COG, and DOT.':'Their histories differ, but their current word is the same.'}</p></div></div>`;
      text=['The displayed histories are different legal paths to the same word.','The search can merge these encounters because the rules assign the same future to COT.','If resources or history affected legal moves, this merge would require a richer state.'][frame];
    }else if(kind==='graph'){
      html=graph(frame>=4?['sun']:['cat','cot','cog','dog'],frame===0?0:frame===1?2:Infinity);
      text=['Each vocabulary word begins as a vertex, including the disconnected word SUN.','A legal character change draws an undirected edge between the two words.','Several paths can meet and form cycles, so the graph is not a tree.','CAT → COT → COG → DOG crosses three edges, regardless of the layout.','SUN has no neighbors in this vocabulary, so a route from CAT to SUN does not exist.'][frame];
    }else if(kind==='representation'){
      if(representation==='list')html=`<div class="adjacency-list">${['cat','cot','cog','dog','sun'].map(w=>`<div>${word(w,w===['cat','cot','cog'][frame])}<span>→</span><span>${neighbors(w).map(n=>n.toUpperCase()).join(', ')||'No neighbors exist.'}</span></div>`).join('')}</div>`;
      else html=`<div class="word-collection">${TEACHING_WORDS.map((w,i)=>`<div>${representation==='array'?`<small>Index ${i}</small>`:''}${word(w,i===frame)}</div>`).join('')}</div><p class="concept-note">${representation==='array'?'The array keeps a sequence that can be scanned.':'The set stores unique vocabulary members for membership queries.'}</p>`;
      text=representation==='list'?['The vocabulary stores words; an adjacency list additionally stores their relationships.','The adjacency list for COT contains CAT, COG, and DOT.','The production game computes connections on demand instead of storing this complete list.'][frame]:representation==='array'?'An array preserves a sequence. Testing membership scans its entries until a match is found or the sequence ends.':'A set stores unique words for membership checks. It does not store their neighbor relationships.';
    }else if(kind==='neighbors'){
      html=`<div class="scan-candidates">${TEACHING_WORDS.map((w,i)=>`<div class="${i===frame?'is-active':''} ${i<=frame&&adjacent('cat',w)?'accepted':''}">${word(w)}<small>${i<=frame?(adjacent('cat',w)?'This is a neighbor.':'This is not a neighbor.'):'This word is waiting.'}</small></div>`).join('')}</div>`;
      text=`The scan compares CAT with ${TEACHING_WORDS[frame].toUpperCase()}. ${adjacent('cat',TEACHING_WORDS[frame])?'Exactly one position differs, so this candidate is a neighbor.':'This candidate does not differ in exactly one position, so it is rejected.'}`;
    }else if(kind==='memory'){
      const state=traces.find(f=>f.action==='discover'&&f.candidate==='cog')!;
      html=structures(state,['Frontier','Discovered','Parents','Distances'][frame]);
      text=['The frontier holds discovered words waiting for expansion, with the oldest word at the front.','The discovered set already contains queued words, preventing another branch from enqueueing them again.','The parent map records COT as the predecessor of COG, even though COG has not yet been expanded.','The distance map assigns COG distance two because its parent COT has distance one.'][frame];
    }else if(kind==='index'){
      const patterns=['*OLD','C*LD','CO*D','COL*'];const buckets=[['bold','cold','gold'],['cold'],['cold','cord'],['cold']];
      html=`<div class="index-costs"><div><span>Full-scan character-check bound</span><strong id="scan-count">${(count*4).toLocaleString('en-US')}</strong></div><div><span>Bucket lookups for a four-letter word</span><strong id="pattern-count">4</strong></div></div><div class="pattern-row">${patterns.map((p,i)=>`<code class="${i===frame?'is-active':''}">${p}</code>`).join('')}</div><p>${frame<4?`The ${patterns[frame]} bucket contains these example words.`:'Removing COLD and duplicates leaves these neighbors.'}</p><div class="bucket-words">${(frame<4?buckets[frame]:['bold','gold','cord']).map(w=>word(w)).join('')}</div><p class="concept-note">The scan count is a bound, and the bucket count excludes key creation and candidate processing. These are operation counts rather than measured timings.</p>`;
      text=frame<4?`Replacing position ${frame+1} in COLD produces ${patterns[frame]}, which identifies one bucket.`:'The lookup collects candidates, removes the current word, and deduplicates repeated entries.';
    }else if(kind==='comparison'){
      const dfs=dfsRoute()!,bfs=teachingSearch.path!;
      html=`<div class="route-comparison"><div><h4>DFS returns this first route.</h4><div class="concept-route">${route(dfs,frame+1)}</div><p>${dfs.length-1} moves are required for this route.</p></div><div><h4>BFS returns this shortest route.</h4><div class="concept-route">${route(bfs,Math.min(frame+1,bfs.length))}</div><p>${bfs.length-1} moves are required for this route.</p></div></div>`;
      text='These panels reveal the returned routes, not simultaneous expansion speeds. Both solvers use the same graph and alphabetical neighbor order.';
    }else if(kind==='bfs'||kind==='invariant'){
      const state=(kind==='bfs'?traces:compact)[frame];
      if(kind==='bfs')html=`<div class="code-walkthrough" aria-label="BFS pseudocode"><ol>${BFS_CODE.map((line,i)=>`<li class="${i===state.line||(state.action==='discover'&&i===7)?'is-active':''}"><code>${escapeHtml(line)}</code></li>`).join('')}</ol></div>`;
      else html=`<div class="distance-layers">${[0,1,2,3].map(d=>`<div class="${state.current&&new Map(state.distances).get(state.current)===d?'is-active':''}"><strong>Distance ${d}</strong><span>${state.distances.filter(([,depth])=>depth===d).map(([w])=>w.toUpperCase()).join(', ')||'No words have been discovered in this layer yet.'}</span></div>`).join('')}</div>`;
      html+=`<p class="current-state">${state.current?`The current word is ${state.current.toUpperCase()}.`:'The search has no current word.'}</p>`+structures(state);
      text=state.caption;
    }else if(kind==='recovery'){
      if(caseName==='same'){html=`<div class="concept-route">${word('cat')}</div><p>The route contains one word and zero moves.</p>`;text='The start already equals the goal, so no transformation is needed.';}
      else if(caseName==='disconnected'){html=graph(['sun']);text='SUN is a valid vocabulary word, but the search exhausts CAT’s component without reaching it and returns no route.';}
      else{
        const backward=['dog','cog','cot','cat'];
        html=`<h4>The trace follows recorded parents.</h4><div class="concept-route backward-route">${route(backward,Math.min(frame+1,4))}</div><h4>The reversed sequence is the playable route.</h4><div class="concept-route">${frame>=4?route([...backward].reverse()):'<span>The search is still tracing parents.</span>'}</div><p>${frame===5?'Every pair is adjacent, both endpoints match, and the route takes three moves.':'The parent of each word lies one distance layer closer to the start.'}</p>`;
        text=frame<4?`The trace has reached ${backward[frame].toUpperCase()} by following parent links toward the start.`:frame===4?'Reversing the recorded sequence produces CAT → COT → COG → DOG.':'The route contract checks legal words, valid edges, endpoints, and the expected shortest distance.';
      }
    }
    body.innerHTML=html;caption.textContent=text;
  }
  const input=container.querySelector<HTMLInputElement>('#validation-word');
  if(input)input.oninput=()=>{validationEdited=true;candidate=input.value.trim().toLowerCase();draw(2);container.querySelector('#validation-announcement')!.textContent=validateMove('cat',candidate,TEACHING_WORDS)||'This move is legal because every rule passes.';};
  const select=container.querySelector<HTMLSelectElement>('#representation');if(select)select.onchange=()=>{representation=select.value;draw(latestFrame);};
  const slider=container.querySelector<HTMLInputElement>('#dictionary-size');if(slider)slider.oninput=()=>{count=Number(slider.value);container.querySelector('#dictionary-count')!.textContent=`${count.toLocaleString('en-US')} words`;draw(latestFrame);};
  const cases=container.querySelector<HTMLSelectElement>('#solver-case');if(cases)cases.onchange=()=>{caseName=cases.value;draw(latestFrame);};
  return {frames:frameCounts[kind],render:draw};
}
