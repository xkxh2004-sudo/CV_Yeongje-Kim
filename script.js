

(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  let toastTimer;
  function notify(text) { const t=$('.toast');t.textContent=text;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2300); }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text);notify('Copied to clipboard'); }
    catch { const d=$('#copy-dialog');d.querySelector('textarea').value=text;d.showModal();d.querySelector('textarea').select(); }
  }
  document.addEventListener('click', e => {const b=e.target.closest('[data-copy]');if(b)copy(citations[b.dataset.copy]);});
  $('#copy-email').addEventListener('click',()=>copy('kim5688@purdue.edu'));
  $('#copy-dialog button').addEventListener('click',()=>$('#copy-dialog').close());
  for(const prefix of ['publication','presentation']) {
    if (!$('#'+prefix+'-list')) continue;
    const entries=$$('#'+prefix+'-list .entry'); const search=$('#'+prefix+'-search'); const year=$('#'+prefix+'-year');
    const buttons=$$('[data-controls="'+prefix+'"] [data-theme]');let theme='All';
    const update=()=>{
      let count=0; const query=search.value.trim().toLocaleLowerCase();
      for(const entry of entries){const yes=(!query||entry.textContent.toLocaleLowerCase().includes(query))&&(year.value==='All'||entry.dataset.year===year.value)&&(theme==='All'||entry.dataset.themes.split('|').includes(theme));entry.hidden=!yes;if(yes)count++;}
      $('#'+prefix+'-count').textContent=count+' of '+entries.length+' '+(prefix==='publication'?'articles':'presentations');
      $('#'+prefix+'-empty').hidden=count!==0;
    };
    buttons.forEach(b=>b.addEventListener('click',()=>{theme=b.dataset.theme;buttons.forEach(x=>{const a=x===b;x.classList.toggle('is-active',a);x.setAttribute('aria-pressed',String(a));});update();}));
    search.addEventListener('input',update);year.addEventListener('change',update);update();
  }
  const toggle=$('#theme-toggle');
  function setTheme(value){document.documentElement.dataset.theme=value;toggle.setAttribute('aria-pressed',String(value==='dark'));toggle.setAttribute('aria-label',value==='dark'?'Switch to light theme':'Switch to dark theme');}
  let saved;try{saved=localStorage.getItem('yk-theme')}catch{}
  setTheme(saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  toggle.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(next);try{localStorage.setItem('yk-theme',next)}catch{}});
  const photos=$$('.gallery-photo');const dialog=$('#photo-dialog');
  photos.forEach(b=>b.addEventListener('click',()=>{const image=b.querySelector('img');dialog.querySelector('img').src=image.src;dialog.querySelector('img').alt=image.alt;dialog.querySelector('p').textContent=b.dataset.caption;dialog.showModal();}));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  function scrollUpdate(){
    $('.site-header').classList.toggle('is-elevated',scrollY>12);
    const max=document.documentElement.scrollHeight-innerHeight;
    $('.scroll-progress').style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';
  }
  addEventListener('scroll',scrollUpdate,{passive:true});scrollUpdate();
  if (!$('#hero-canvas')) return;
  // A quiet, pointer-responsive research network, confined to the introduction.
  const canvas=$('#hero-canvas'),ctx=canvas.getContext('2d');const reduced=matchMedia('(prefers-reduced-motion: reduce)');let w,h,nodes=[],pointer={x:-999,y:-999},frame;
  function resize(){w=innerWidth;h=Math.min(innerHeight,900);const scale=Math.min(devicePixelRatio||1,2);canvas.width=w*scale;canvas.height=h*scale;canvas.style.height=h+'px';ctx.setTransform(scale,0,0,scale,0,0);nodes=Array.from({length:13},(_,i)=>({x:w*(.12+(i*7%13)/17),y:h*(.12+(i*5%13)/17),phase:i}));draw(0);}
  function draw(t){ctx.clearRect(0,0,w,h);const dark=document.documentElement.dataset.theme==='dark';ctx.strokeStyle=dark?'rgba(111,193,170,.14)':'rgba(23,107,91,.12)';ctx.fillStyle=dark?'rgba(111,193,170,.3)':'rgba(23,107,91,.24)';const points=nodes.map(n=>{const dx=n.x-pointer.x,dy=n.y-pointer.y,dist=Math.hypot(dx,dy)||1;return {x:n.x+(reduced.matches?0:Math.sin(t/6000+n.phase)*12)+(dist<150?dx/dist*12:0),y:n.y+(reduced.matches?0:Math.cos(t/7000+n.phase)*12)+(dist<150?dy/dist*12:0)}});points.forEach((n,i)=>{points.slice(i+1).forEach(m=>{if(Math.hypot(n.x-m.x,n.y-m.y)<230){ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);ctx.stroke();}});ctx.beginPath();ctx.arc(n.x,n.y,2.6,0,Math.PI*2);ctx.fill();});}
  function animate(t){if(scrollY<1000&&!document.hidden)draw(t);frame=requestAnimationFrame(animate);}
  resize();if(!reduced.matches)frame=requestAnimationFrame(animate);
  addEventListener('resize',resize);addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};},{passive:true});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);if(!reduced.matches)frame=requestAnimationFrame(animate);else draw(0);});
  toggle.addEventListener('click',()=>draw(0));
})();
