import {CHAPTERS,LESSONS} from './lesson-content';
import {mountLessonAnimation} from './lesson-animation';
import {escapeHtml,mountLessonVisual} from './lesson-visuals';

export const lessonMarkup=`
<section id="learn" class="learning engineering-lessons" aria-labelledby="learn-title">
  <div class="learning-intro"><div><span class="eyebrow">FROM GAME RULES TO A WORKING SOLVER</span><h2 id="learn-title">How would you<br>build this game?</h2><p>Think through the problem, choose its data structures, and build an algorithm.<br>Twelve lessons connect the decisions to the code.</p></div><div class="learning-meta"><span class="optional-label">OPTIONAL EXPLORATION</span><span id="lesson-progress" role="status">0 of 12 understood</span><a href="#game">Back to the game ↑</a></div></div>
  <div class="lesson-tabs chapter-tabs" role="tablist" aria-label="Engineering chapters">${CHAPTERS.map((chapter,i)=>`<button id="chapter-${i}" class="lesson-tab" role="tab" aria-selected="${i===0}" aria-controls="engineering-panel" tabindex="${i===0?0:-1}"><span class="lesson-number">0${i+1}</span><span><strong>${chapter.title}</strong><small>${chapter.description}</small></span></button>`).join('')}</div>
  <section id="engineering-panel" role="tabpanel" aria-labelledby="chapter-0"><nav id="lesson-outline" class="lesson-outline" aria-label="Lessons in this chapter"></nav><div id="engineering-slide"></div></section>
  <div class="lesson-navigation"><button id="previous-lesson" class="secondary">Previous lesson</button><span id="lesson-position"></span><button id="next-lesson" class="primary">Next lesson</button></div>
  <p class="lesson-reference">This course builds on <a href="https://www.youtube.com/watch?v=cS-198wtfj0" target="_blank" rel="noreferrer">AlgoMonster’s explanation of DFS and BFS</a> and adapts the ideas to this game’s implementation.</p>
</section>`;

export function mountLessons(getPuzzle:()=>{start:string;goal:string;player:string[];path:string[]|null}){
  const find=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
  const answers=new Map<number,number>();
  let active=0,animation:ReturnType<typeof mountLessonAnimation>|null=null;
  function progress(){find('lesson-progress').textContent=`${[...answers].filter(([i,a])=>LESSONS[i].correct===a).length} of 12 understood`;}
  function select(index:number,focus=false){
    animation?.dispose();active=index;
    const chapter=Math.floor(index/4),lesson=LESSONS[index];
    CHAPTERS.forEach((_,i)=>{const tab=find(`chapter-${i}`);tab.setAttribute('aria-selected',String(i===chapter));tab.tabIndex=i===chapter?0:-1;});
    find('engineering-panel').setAttribute('aria-labelledby',`chapter-${chapter}`);
    find('lesson-outline').innerHTML=LESSONS.slice(chapter*4,chapter*4+4).map((item,i)=>`<button data-slide="${chapter*4+i}" class="outline-slide" ${chapter*4+i===index?'aria-current="step"':''}><span>${String(chapter*4+i+1).padStart(2,'0')}</span>${item.title}</button>`).join('');
    find('lesson-outline').querySelectorAll<HTMLButtonElement>('[data-slide]').forEach(button=>button.onclick=()=>select(Number(button.dataset.slide),true));
    find('engineering-slide').innerHTML=`<section class="lesson-panel"><div class="lesson-copy"><span class="eyebrow">CHAPTER ${chapter+1} / LESSON ${index+1}</span><h3 id="slide-title" tabindex="-1">${lesson.title}</h3><p class="lesson-summary">${lesson.summary}</p>${lesson.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}<div class="engineering-decision"><strong>Make the engineering decision.</strong><p>${lesson.decision}</p></div><p class="lesson-prompt">${lesson.question}</p><div class="choices stacked">${lesson.choices.map((choice,i)=>`<button data-choice="${i}" aria-pressed="${answers.get(index)===i}">${choice}</button>`).join('')}</div><p id="prediction-feedback" class="lesson-feedback" role="status" ${answers.has(index)?`data-correct="${answers.get(index)===lesson.correct}"`:''}>${answers.has(index)?lesson.feedback[answers.get(index)!]:''}</p></div><div id="concept-stage" class="experiment engineering-experiment"></div></section>`;
    find('engineering-slide').querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(button=>button.onclick=()=>{
      const answer=Number(button.dataset.choice);answers.set(index,answer);
      find('prediction-feedback').textContent=lesson.feedback[answer];find('prediction-feedback').dataset.correct=String(answer===lesson.correct);
      find('engineering-slide').querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));progress();
    });
    const visual=mountLessonVisual(lesson,find('concept-stage'));
    animation=mountLessonAnimation({prefix:'concept',...visual});
    if(index===11){
      const compare=document.createElement('div');compare.className='compare-box';
      compare.innerHTML='<p>You can compare the result with your active puzzle.</p><button id="compare-puzzle" class="secondary">Compare with my puzzle</button><p id="lesson-solution" class="lesson-solution" hidden></p><small>This reveals a solution to your active puzzle.</small>';
      find('concept-stage').append(compare);
      find('compare-puzzle').onclick=()=>{const puzzle=getPuzzle();find('lesson-solution').hidden=false;find('lesson-solution').textContent=puzzle.path?`The shortest route is ${puzzle.path.map(w=>w.toUpperCase()).join(' → ')}. It takes ${puzzle.path.length-1} moves. Your ladder currently uses ${puzzle.player.length-1} moves.`:'No route exists in this vocabulary.';};
    }
    find<HTMLButtonElement>('previous-lesson').disabled=index===0;find<HTMLButtonElement>('next-lesson').disabled=index===11;
    find('lesson-position').textContent=`Lesson ${index+1} of 12`;
    if(focus){const title=find('slide-title');title.focus({preventScroll:true});title.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  CHAPTERS.forEach((_,i)=>{
    find(`chapter-${i}`).onclick=()=>select(i*4);
    find(`chapter-${i}`).onkeydown=event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;select(next*4);find(`chapter-${next}`).focus();
    };
  });
  find('previous-lesson').onclick=()=>select(Math.max(0,active-1),true);
  find('next-lesson').onclick=()=>select(Math.min(11,active+1),true);
  const clearComparison=()=>{const result=document.getElementById('lesson-solution');if(result)result.hidden=true;};
  select(0);
  return {puzzleChanged:clearComparison,playerChanged:clearComparison};
}
