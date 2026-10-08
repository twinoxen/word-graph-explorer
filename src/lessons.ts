import {search} from './engine';
import {mountLessonAnimation} from './lesson-animation';

const titles=['Words form a graph.','BFS explores in layers.','Parents recover the route.','An index reduces repeated work.'];
const subtitles=['One letter creates an edge.','A queue preserves distance order.','Each parent records a connection.','An index trades memory for lookup work.'];
const demoWords=['cat','cot','bat','cog','dot','dog'];
const demo=search('cat','dog',demoWords);

export const lessonMarkup=`
<section id="learn" class="learning" aria-labelledby="learn-title">
  <div class="learning-intro"><div><span class="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2 id="learn-title">There’s a bigger idea<br>behind every small move.</h2><p>You’ve played with words. Now play with the ideas underneath them.<br>Each of these four experiments lets you test an idea and watch it unfold.</p></div><div class="learning-meta"><span class="optional-label">OPTIONAL EXPLORATION</span><span id="lesson-progress" role="status">0 of 4 explored</span><a href="#game">Back to the game ↑</a></div></div>
  <div class="lesson-tabs" role="tablist" aria-label="Explore how the game works">${titles.map((title,i)=>`<button id="tab-${i}" class="lesson-tab" role="tab" aria-selected="${i===0}" aria-controls="${['lesson-edges','lesson-bfs','lesson-parents','lesson-scale'][i]}" tabindex="${i===0?0:-1}"><span class="lesson-number">0${i+1}</span><span><strong>${title}</strong><small>${subtitles[i]}</small></span><span class="lesson-check" aria-hidden="true"></span></button>`).join('')}</div>
  <section id="lesson-edges" class="lesson-panel" role="tabpanel" aria-labelledby="tab-0">
    <div class="lesson-copy"><span class="eyebrow">01 / CONNECTIONS</span><h3>A dictionary is a map<br>you haven’t drawn yet.</h3><p>Imagine each word as a place. A legal one-letter change draws a road to another place. Engineers call these places <b>nodes</b> and the roads <b>edges</b>.</p><p class="lesson-prompt">Which word can connect directly to CAT?</p><div class="choices" data-question="edges"><button data-answer="cot">COT</button><button data-answer="dog">DOG</button><button data-answer="cat">CAT</button></div><p id="edges-feedback" class="lesson-feedback" role="status"></p><div id="edges-explanation" class="lesson-explanation" hidden><b>One difference creates one edge.</b><p>CAT → COT changes only A to O. CAT → DOG needs three changes, so there is no direct edge. A word cannot connect to itself under this game’s rule.</p><p>The code creates an edge only when both words have the same length, differ in exactly one character, and belong to the vocabulary. Connections work in both directions: this is an <b>undirected graph</b>.</p></div></div>
    <div id="edges-stage" class="experiment"><span class="experiment-label">A single rule creates this network.</span><svg class="mini-graph" viewBox="0 0 440 290" role="img" aria-label="CAT connects to BAT and COT. COT connects to COG and DOT; both connect to DOG."><g class="mini-edges"><path d="M70 145L175 60M175 200L285 110M175 200L285 250M285 110L385 180M285 250L385 180"/><path id="animated-edge" pathLength="1" d="M70 145L175 200"/></g>${[['cat',70,145],['bat',175,60],['cot',175,200],['cog',285,110],['dot',285,250],['dog',385,180]].map(([word,x,y])=>`<g data-word="${word}" class="mini-node ${word==='cat'?'mini-start':word==='dog'?'mini-goal':''}" transform="translate(${x},${y})"><rect x="-31" y="-17" width="62" height="34" rx="10"/><text text-anchor="middle" dy="5">${String(word).toUpperCase()}</text></g>`).join('')}</svg><div class="letter-change"><span>C<span class="changed-letter">A</span>T</span><span class="change-arrow">→</span><span>C<span class="changed-letter">O</span>T</span></div><p class="experiment-caption">A route through this map is a word ladder.<br>The game has been graph traversal all along.</p><p id="edges-caption" class="animation-caption" role="status"></p></div>
  </section>
  <section id="lesson-bfs" class="lesson-panel" role="tabpanel" aria-labelledby="tab-1" hidden>
    <div class="lesson-copy"><span class="eyebrow">02 / SEARCH</span><h3>The search explores each layer<br>before moving farther away.</h3><p>Breadth-first search (BFS) explores words one move away before words two moves away. A <b>first in, first out queue</b> keeps that promise.</p><p>In this tiny example, CAT’s neighbors are added alphabetically: BAT, then COT. Other neighbor orders can also produce a shortest route.</p><p class="lesson-prompt">After exploring CAT, which word leaves the queue next?</p><div class="choices" data-question="bfs"><button data-answer="cot">COT</button><button data-answer="bat">BAT</button><button data-answer="dog">DOG</button></div><p id="bfs-feedback" class="lesson-feedback" role="status"></p><div id="bfs-explanation" class="lesson-explanation" hidden><b>The oldest item goes first.</b><p>Remove BAT from the front. Add unseen neighbors to the back. Mark words when they enter the queue so cycles cannot add them again. This preserves distance order.</p><p>Watch the queue as the search advances. COG and DOT appear only after COT is explored.</p></div></div>
    <div id="bfs-stage" class="experiment queue-experiment"><span class="experiment-label">You can follow every step in this six-word search.</span><div class="demo-rings"><span data-layer="0">0 moves <b>CAT</b></span><span data-layer="1">1 move <b>BAT · COT</b></span><span data-layer="2">2 moves <b>COG · DOT</b></span><span data-layer="3">3 moves <b>DOG</b></span></div><div class="demo-status"><span>JUST EXPLORED <strong id="demo-current">CAT</strong></span><span>DISTANCE <strong id="demo-depth">0</strong></span></div><span class="field-label">FRONT → FIFO QUEUE → BACK</span><div id="demo-queue" class="demo-queue"></div><p id="demo-note" class="experiment-caption" role="status"></p></div>
  </section>
  <section id="lesson-parents" class="lesson-panel" role="tabpanel" aria-labelledby="tab-2" hidden>
    <div class="lesson-copy"><span class="eyebrow">03 / THE SHORTEST ROUTE</span><h3>Finding the goal is<br>only half the story.</h3><p>When BFS first discovers a word, it records the word that led there: its <b>parent</b>. That breadcrumb lets the search reconstruct a route.</p><p class="lesson-prompt">DOG has been reached. How do we recover the route?</p><div class="choices stacked" data-question="parents"><button data-answer="parents">Follow the recorded parents</button><button data-answer="alphabet">Sort the explored words alphabetically</button></div><p id="parents-feedback" class="lesson-feedback" role="status"></p><div id="parents-explanation" class="lesson-explanation" hidden><b>The search traces the parents backward and then reverses the route.</b><p>Each parent was discovered one layer earlier. With every move costing one, BFS reaches the goal at the smallest possible depth. There can be several equally short routes.</p><p>Change the rules to give edges different costs and this guarantee disappears. A weighted shortest-path algorithm such as Dijkstra’s is needed for nonnegative costs.</p></div></div>
    <div id="parents-stage" class="experiment"><span class="experiment-label">Each recorded parent leads back toward the start.</span><div class="parent-cards"><span><small>WORD</small><b>COT</b><small>PARENT: CAT</small></span><span><small>WORD</small><b>COG</b><small>PARENT: COT</small></span><span><small>WORD</small><b>DOG</b><small>PARENT: COG</small></span></div><div id="parent-trace" class="parent-trace"><span>The search follows each parent toward CAT.</span><strong class="trace-back"><span data-parent="DOG">DOG</span> ← <span data-parent="COG">COG</span> ← <span data-parent="COT">COT</span> ← <span data-parent="CAT">CAT</span></strong><span>The search reverses the route for the player.</span><strong class="trace-forward"><span data-route="CAT">CAT</span> → <span data-route="COT">COT</span> → <span data-route="COG">COG</span> → <span data-route="DOG">DOG</span></strong></div><p id="parents-caption" class="animation-caption" role="status"></p><div class="compare-box"><p>Try the idea on your current challenge.</p><button id="compare-puzzle" class="secondary">Compare with my puzzle</button><p id="lesson-solution" class="lesson-solution" hidden></p><small>This reveals a solution to your active puzzle.</small></div></div>
  </section>
  <section id="lesson-scale" class="lesson-panel" role="tabpanel" aria-labelledby="tab-3" hidden>
    <div class="lesson-copy"><span class="eyebrow">04 / ENGINEERING TRADEOFFS</span><h3>A larger dictionary changes<br>the design tradeoff.</h3><p>This app finds neighbors by scanning its vocabulary. This approach is simple to write and inspect, but repeated scans increase the amount of work.</p><p class="lesson-prompt">For repeated searches across a large dictionary, what reduces neighbor lookup work?</p><div class="choices stacked" data-question="scale"><button data-answer="index">Reuse a wildcard index</button><button data-answer="scan">Scan every word on every lookup</button></div><p id="scale-feedback" class="lesson-feedback" role="status"></p><div id="scale-explanation" class="lesson-explanation" hidden><b>The index organizes the dictionary once so later searches can reuse that work.</b><p>To build the index, group words by patterns such as CO*D. COLD and CORD share that bucket. Query four patterns, collect their candidates, and remove the current word and duplicates.</p><p>The index costs build time and memory. Four bucket lookups do not mean four total operations: pattern creation and reading candidate words still cost work. Large buckets can remain expensive.</p><p>This app’s repeated full scans can take O(V²L) search work. BFS on a prebuilt adjacency graph is O(V + E). The current snapshot history also copies queues and explored lists, using up to O(V²) storage. V counts words, E counts connections, and L is the word length.</p></div></div>
    <div id="scale-stage" class="experiment scale-experiment"><span class="experiment-label">This example looks up the neighbors of a four-letter word.</span><label class="size-label" for="dictionary-size">Dictionary size <output id="dictionary-count">1,000 words</output></label><input id="dictionary-size" type="range" min="100" max="20000" step="100" value="1000"><div class="cost-row"><span>Full scan<small>Upper bound on character checks</small></span><strong id="scan-count">4,000</strong></div><div class="cost-bar"><span id="scan-bar"></span></div><div class="cost-row index-cost"><span>Indexed lookup<small>Bucket lookups, plus candidate processing</small></span><strong id="pattern-count">4</strong></div><div class="patterns"><code data-pattern="0">*OLD</code><code data-pattern="1">C*LD</code><code data-pattern="2">CO*D</code><code data-pattern="3">COL*</code></div><div class="bucket-example"><span id="bucket-label">The *OLD bucket contains these example words.</span><div id="bucket-words" class="bucket-words"></div></div><p id="scale-caption" class="animation-caption" role="status"></p><p class="experiment-caption">These numbers count operations; they do not measure elapsed time.<br>The index is a proposed optimization; the game uses full scans.</p></div>
  </section>
</section>`;

export function mountLessons(getPuzzle:()=>{start:string;goal:string;player:string[];path:string[]|null}){
  const find=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
  const panels=['lesson-edges','lesson-bfs','lesson-parents','lesson-scale'];
  const explored=new Set<number>();
  let cursor=1,active=0;
  function select(index:number,focus=false){
    active=index;
    panels.forEach((id,i)=>{find(id).hidden=i!==index;const tab=find(`tab-${i}`);tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    animations.forEach(animation=>animation.pause());
    animations[index].restart();
    if(focus)find(`tab-${index}`).focus();
  }
  titles.forEach((_,i)=>{
    find(`tab-${i}`).onclick=()=>select(i);
    find(`tab-${i}`).onkeydown=event=>{
      const key=event.key;
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(key))return;
      event.preventDefault();select(key==='Home'?0:key==='End'?3:(active+(key==='ArrowRight'?1:3))%4,true);
    };
  });
  function queue(){
    const snapshot=demo.snapshots[cursor];
    find('demo-current').textContent=snapshot.current?.toUpperCase()||'—';
    find('demo-depth').textContent=String(snapshot.depth);
    find('demo-queue').replaceChildren(...snapshot.queue.map(word=>{const chip=document.createElement('code');chip.textContent=word.toUpperCase();chip.className='queue-chip-enter';return chip;}));
    if(!snapshot.queue.length)find('demo-queue').textContent='Queue empty';
    find('demo-note').textContent=snapshot.done?'The search reached DOG at depth 3 after exploring every word at depth 2.':`The search has explored ${snapshot.visited.map(w=>w.toUpperCase()).join(', ')}. The next queued word is ${snapshot.queue[0]?.toUpperCase()}.`;
    document.querySelectorAll<HTMLElement>('[data-layer]').forEach(layer=>layer.classList.toggle('active-layer',Number(layer.dataset.layer)===snapshot.depth));
  }
  const answers:Record<string,{index:number;correct:string;yes:string;no:Record<string,string>}>= {
    edges:{index:0,correct:'cot',yes:'The letter A changes to O, so these words share an edge.',no:{dog:'CAT and DOG differ in three letters. They need intermediate words.',cat:'That changes zero letters. Each move must change exactly one letter.'}},
    bfs:{index:1,correct:'bat',yes:'BAT entered first, so BAT leaves first. Watch how the search explores the queue.',no:{cot:'COT is one move away too, but BAT entered this queue first.',dog:'DOG is three moves away. The queue must explore closer layers first.'}},
    parents:{index:2,correct:'parents',yes:'Follow each recorded parent back to the start, and then reverse the sequence.',no:{alphabet:'Alphabetical order says nothing about edges. Recorded parents preserve the actual connections.'}},
    scale:{index:3,correct:'index',yes:'Reuse the index to look up matching buckets instead of scanning every word.',no:{scan:'A full scan repeats the dictionary-wide work every time. An index can reuse earlier organization.'}}
  };
  document.querySelectorAll<HTMLButtonElement>('[data-question] button').forEach(button=>button.onclick=()=>{
    const question=button.parentElement!.dataset.question!,rule=answers[question],answer=button.dataset.answer!,correct=answer===rule.correct;
    const feedback=find(`${question}-feedback`);feedback.dataset.correct=String(correct);feedback.textContent=correct?rule.yes:rule.no[answer];
    button.parentElement!.querySelectorAll('button').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    if(correct){
      explored.add(rule.index);find(`${question}-explanation`).hidden=false;
      find('lesson-progress').textContent=`${explored.size} of 4 explored`;
      find(`tab-${rule.index}`).querySelector('.lesson-check')!.textContent='✓';

    }
  });

  find('compare-puzzle').onclick=()=>{
    const puzzle=getPuzzle();find('lesson-solution').hidden=false;
    find('lesson-solution').textContent=puzzle.path?`The shortest route is ${puzzle.path.map(w=>w.toUpperCase()).join(' → ')}. It takes ${puzzle.path.length-1} moves. Your ladder uses ${puzzle.player.length-1} moves and ${puzzle.player.at(-1)===puzzle.goal?'has reached the goal.':'has not reached the goal yet.'}`:'No route exists in this vocabulary.';
  };
  const slider=find<HTMLInputElement>('dictionary-size');
  slider.oninput=()=>{
    const count=Number(slider.value);find('dictionary-count').textContent=`${count.toLocaleString('en-US')} words`;
    find('scan-count').textContent=(count*4).toLocaleString('en-US');find('scan-bar').style.width=`${count/200}%`;
  };
  const edgeCaptions=[
    'CAT and COT are separate nodes because each word is a distinct place in the graph.',
    'The middle letters differ because CAT contains A where COT contains O.',
    'The algorithm draws an edge because exactly one letter differs between these words.',
    'The connection works in both directions because either word can change into the other in one move.'
  ];
  const edgeAnimation=mountLessonAnimation({prefix:'edges',frames:4,render:frame=>{
    find('edges-caption').textContent=edgeCaptions[frame];
    document.querySelectorAll<SVGElement>('#edges-stage [data-word]').forEach(node=>node.classList.toggle('active-node',frame>=2&&['cat','cot'].includes(node.dataset.word!)));
  }});
  const bfsAnimation=mountLessonAnimation({prefix:'bfs',frames:demo.snapshots.length-1,render:frame=>{cursor=frame+1;queue();}});
  const backward=['DOG','COG','COT','CAT'],forward=[...backward].reverse();
  const parentCaptions=[
    'The search starts at DOG because it has reached the goal.',
    'DOG records COG as its parent, so the trace moves back to COG.',
    'COG records COT as its parent, so the trace moves back to COT.',
    'COT records CAT as its parent, so the trace has reached the start.',
    'The algorithm reverses the recorded sequence so the playable route begins at CAT.',
    'The forward route moves from CAT to COT by changing one letter.',
    'The forward route moves from COT to COG by changing one letter.',
    'The route reaches DOG in three moves, which matches the depth where BFS found the goal.'
  ];
  const parentAnimation=mountLessonAnimation({prefix:'parents',frames:8,render:frame=>{
    find('parents-caption').textContent=parentCaptions[frame];
    document.querySelectorAll<HTMLElement>('[data-parent]').forEach(node=>{node.classList.toggle('traced',backward.indexOf(node.dataset.parent!)<=Math.min(frame,3));node.classList.toggle('trace-current',frame<4&&node.dataset.parent===backward[frame]);});
    document.querySelectorAll<HTMLElement>('[data-route]').forEach(node=>{node.classList.toggle('traced',frame>=4&&forward.indexOf(node.dataset.route!)<=frame-4);node.classList.toggle('trace-current',frame>=4&&node.dataset.route===forward[frame-4]);});
  }});
  const patterns=['*OLD','C*LD','CO*D','COL*'];
  const buckets=[['BOLD','COLD','GOLD'],['COLD'],['COLD','CORD'],['COLD']];
  const scaleCaptions=[
    'The lookup replaces the first letter to form *OLD and reads the words in that bucket.',
    'The lookup replaces the second letter to form C*LD and reads the words in that bucket.',
    'The CO*D bucket groups COLD and CORD because only their third letters differ.',
    'The final pattern is COL*, which collects words that differ only in their last letter.',
    'The lookup removes COLD itself and duplicate candidates, leaving BOLD, GOLD, and CORD as neighbors in this example.'
  ];
  const scaleAnimation=mountLessonAnimation({prefix:'scale',frames:5,render:frame=>{
    find('scale-caption').textContent=scaleCaptions[frame];
    document.querySelectorAll<HTMLElement>('[data-pattern]').forEach(pattern=>pattern.classList.toggle('active-pattern',Number(pattern.dataset.pattern)===frame));
    find('bucket-label').textContent=frame===4?'These words are the distinct neighbors found in this example.':`The ${patterns[frame]} bucket contains these example words.`;
    find('bucket-words').replaceChildren(...(frame===4?['BOLD','GOLD','CORD']:buckets[frame]).map(word=>{const chip=document.createElement('code');chip.textContent=word;chip.className='queue-chip-enter';return chip;}));
  }});
  const animations=[edgeAnimation,bfsAnimation,parentAnimation,scaleAnimation];
  slider.dispatchEvent(new Event('input'));select(0);
  return {puzzleChanged:()=>{find('lesson-solution').hidden=true;},playerChanged:()=>{find('lesson-solution').hidden=true;}};
}
