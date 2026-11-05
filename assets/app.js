(() => {
  const root = document.documentElement;
  const key='java-course-theme';
  if(localStorage.getItem(key)==='dark')root.dataset.theme='dark';
  document.getElementById('theme')?.addEventListener('click',()=>{
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    localStorage.setItem(key,root.dataset.theme);
  });
  const storedSize=Number(localStorage.getItem('java-course-font')||'18');
  if(storedSize>=15&&storedSize<=26)root.style.setProperty('--body-size',storedSize+'px');
  for(const [id,delta] of [['font-plus',1],['font-minus',-1]]){
    document.getElementById(id)?.addEventListener('click',()=>{
      let size=Math.max(15,Math.min(26,Number(localStorage.getItem('java-course-font')||18)+delta));
      root.style.setProperty('--body-size',size+'px');localStorage.setItem('java-course-font',size);
    });
  }
  document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.body.classList.toggle('sidebar-open'));
  document.querySelectorAll('.sidebar a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('sidebar-open')));
  document.querySelectorAll('.copy').forEach(button=>button.addEventListener('click',async()=>{
    const text=button.closest('.codebox').querySelector('code').innerText;
    try{await navigator.clipboard.writeText(text);button.textContent='복사됨';setTimeout(()=>button.textContent='코드 복사',1300)}catch{button.textContent='복사 실패'}
  }));
  // Section position follows scroll as well as anchor clicks. The previous observer
  // could leave no highlighted item when the heading was between observer margins.
  const tocLinks=[...document.querySelectorAll('.toc a[href^="#"]')];
  const sections=tocLinks.map(a=>{
    const id=decodeURIComponent(a.hash.slice(1));
    return {a,heading:document.getElementById(id)};
  }).filter(x=>x.heading);
  document.querySelectorAll('.sidebar .chapter.active').forEach(a=>a.setAttribute('aria-current','page'));
  let currentSection=null;
  function updateCurrentSection(){
    if(!sections.length)return;
    const cutoff=window.scrollY+Math.min(180,window.innerHeight*.28);
    let chosen=sections[0];
    for(const entry of sections){
      if(entry.heading.getBoundingClientRect().top+window.scrollY<=cutoff)chosen=entry;
      else break;
    }
    if(currentSection===chosen.a)return;
    currentSection=chosen.a;
    for(const {a} of sections){
      const active=a===currentSection;
      a.classList.toggle('current',active);
      if(active)a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    }
  }
  let pending=false;
  function scheduleCurrentSection(){
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{pending=false;updateCurrentSection()});
  }
  window.addEventListener('scroll',scheduleCurrentSection,{passive:true});
  window.addEventListener('resize',scheduleCurrentSection);
  window.addEventListener('hashchange',()=>requestAnimationFrame(updateCurrentSection));
  tocLinks.forEach(a=>a.addEventListener('click',()=>setTimeout(updateCurrentSection,350)));
  updateCurrentSection();
  window.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea,[contenteditable]'))return;
    const current=location.pathname.match(/lesson(\d\d)\.html$/);
    if(!current)return;
    const n=Number(current[1]);
    if(e.altKey&&e.key==='ArrowRight'&&n<10)location.href=`lesson${String(n+1).padStart(2,'0')}.html`;
    if(e.altKey&&e.key==='ArrowLeft'&&n>1)location.href=`lesson${String(n-1).padStart(2,'0')}.html`;
  });
})();

/* Classroom tools: per-page pen/highlighter strokes over the document. */
(() => {
  const root=document.documentElement;
  const actions=document.querySelector('.top-actions');
  if(actions){
    let codeSize=Number(localStorage.getItem('java-course-code-font')||22);
    codeSize=Math.min(32,Math.max(17,codeSize));
    root.style.setProperty('--code-size',`${codeSize}px`);
    const controls=[['코드−',-2],['코드+',2]];
    for(const [label,delta] of controls){
      const b=document.createElement('button');b.className='code-size-btn';b.type='button';b.textContent=label;
      b.title='코드 글자 크기 조절';
      b.addEventListener('click',()=>{codeSize=Math.max(17,Math.min(32,codeSize+delta));root.style.setProperty('--code-size',`${codeSize}px`);localStorage.setItem('java-course-code-font',String(codeSize))});
      actions.prepend(b);
    }
  }

  const canvas=document.createElement('canvas');canvas.className='annotation-canvas';canvas.setAttribute('aria-label','강의 화면 필기 레이어');
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const storeKey='java-course-annotation:'+location.pathname;
  let strokes=[];
  try{const raw=JSON.parse(localStorage.getItem(storeKey)||'[]');if(Array.isArray(raw))strokes=raw.filter(x=>Array.isArray(x.points));}catch{}
  const colors=[['노랑','#ffd83d'],['분홍','#ff5d9e'],['하늘','#28c7e8'],['초록','#38c778'],['빨강','#f04452'],['파랑','#327bff']];
  let color='#ffd83d',tool='pen',size=5,open=false,drawing=false,current=null;
  const launch=document.createElement('button');launch.className='annot-launch';launch.type='button';launch.textContent='✎ 판서';launch.title='펜과 형광펜으로 화면에 필기';document.body.appendChild(launch);
  const bar=document.createElement('div');bar.className='annot-toolbar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','판서 도구');bar.hidden=true;document.body.appendChild(bar);
  const addBtn=(text,title,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.title=title;b.addEventListener('click',fn);bar.appendChild(b);return b};
  const pen=addBtn('✎ 펜','일반 펜',()=>selectTool('pen'));
  const highlight=addBtn('▰ 형광펜','반투명 형광펜',()=>selectTool('highlight'));
  const eraser=addBtn('⌫ 지우개','그린 선을 선택해서 지우기',()=>selectTool('erase'));
  const sep=()=>{const s=document.createElement('span');s.className='divider';bar.appendChild(s)};
  sep();
  const swatches=colors.map(([name,c])=>{const b=addBtn('',name,()=>{color=c;updateButtons()});b.className='swatch';b.style.setProperty('--swatch',c);b.dataset.color=c;return b});
  sep();
  const slider=document.createElement('input');slider.type='range';slider.min='3';slider.max='40';slider.value=String(size);slider.className='annot-size';slider.title='펜 굵기';slider.setAttribute('aria-label','펜 굵기');slider.addEventListener('input',()=>size=Number(slider.value));bar.appendChild(slider);
  addBtn('↶ 취소','마지막 획 취소',()=>{strokes.pop();save();draw()});
  addBtn('모두 지우기','현재 페이지 필기 모두 삭제',()=>{strokes=[];save();draw()});
  addBtn('닫기','판서 종료',()=>setOpen(false));
  const status=document.createElement('span');status.className='annot-status';status.textContent='Esc: 판서 닫기';bar.appendChild(status);
  function selectTool(v){tool=v;updateButtons()}
  function updateButtons(){for(const [b,v] of [[pen,'pen'],[highlight,'highlight'],[eraser,'erase']])b.setAttribute('aria-pressed',String(tool===v));swatches.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===color)))}
  function setOpen(v){open=v;bar.hidden=!v;launch.hidden=v;canvas.classList.toggle('drawing',v);updateButtons();draw()}
  launch.addEventListener('click',()=>setOpen(true));
  function save(){try{localStorage.setItem(storeKey,JSON.stringify(strokes))}catch{}}
  function point(e){return [e.clientX+window.scrollX,e.clientY+window.scrollY]}
  function visiblePoint(p){return [p[0]-window.scrollX,p[1]-window.scrollY]}
  function renderStroke(s){const pts=s.points;if(!pts.length)return;const first=visiblePoint(pts[0]);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=s.tool==='highlight'?0.34:1;ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.size;
    if(pts.length===1){ctx.beginPath();ctx.arc(first[0],first[1],s.size/2,0,Math.PI*2);ctx.fill()}
    else{ctx.beginPath();ctx.moveTo(first[0],first[1]);for(let i=1;i<pts.length;i++){const p=visiblePoint(pts[i]);ctx.lineTo(p[0],p[1])}ctx.stroke()}
    ctx.restore()}
  function resize(){const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(window.innerWidth*dpr);canvas.height=Math.round(window.innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
  function draw(){ctx.clearRect(0,0,window.innerWidth,window.innerHeight);strokes.forEach(renderStroke);if(current)renderStroke(current)}
  function eraseAt(p){const r=18;const before=strokes.length;strokes=strokes.filter(s=>!s.points.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<r+s.size/2));if(strokes.length!==before){save();draw()}}
  canvas.addEventListener('pointerdown',e=>{if(!open||e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const p=point(e);if(tool==='erase')eraseAt(p);else{current={tool,color,size,points:[p]};draw()}});
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=point(e);if(tool==='erase')eraseAt(p);else if(current){current.points.push(p);draw()}});
  function end(){if(current){strokes.push(current);current=null;save();draw()}drawing=false}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  window.addEventListener('resize',resize);window.addEventListener('scroll',()=>draw(),{passive:true});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){end();setOpen(false)}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&open){e.preventDefault();strokes.pop();save();draw()}});
  updateButtons();resize();
})();

