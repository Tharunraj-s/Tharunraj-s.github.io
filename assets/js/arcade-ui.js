/* Full-screen arcade mode. Every entry is explicitly requested by the visitor. */
(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'arcade-rotate-dialog';
  dialog.setAttribute('aria-labelledby', 'arcade-rotate-title');
  dialog.innerHTML = `<button class="arcade-prompt-close" aria-label="Cancel full screen">×</button><svg class="arcade-tilt" viewBox="0 0 100 100" aria-hidden="true"><rect x="32" y="18" width="36" height="64" rx="7" fill="none" stroke="currentColor" stroke-width="4"/><path d="M17 50A33 33 0 0 1 50 17M17 50l-7-8m7 8 9-5M83 50A33 33 0 0 1 50 83m33-33 7 8m-7-8-9 5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><h3 id="arcade-rotate-title">A little more room to play.</h3><p class="arcade-rotate-copy">Turn your phone sideways, then enter full screen.</p><button class="arcade-enter" type="button">Enter full screen ⛶</button>`;
  document.body.append(dialog);
  const shell = document.createElement('div');
  shell.className = 'arcade-screen'; shell.hidden = true; shell.tabIndex = -1;
  shell.setAttribute('role', 'dialog'); shell.setAttribute('aria-modal', 'true'); shell.setAttribute('aria-label', 'Full-screen game');
  shell.innerHTML = '<div class="arcade-screen-top"><span>YOUR MOVE. YOUR SCREEN.</span><button type="button" class="arcade-exit">Exit full screen ×</button></div><p class="arcade-orientation-note" hidden>Turn your phone sideways for a wider view.</p><div class="arcade-screen-slot"></div>';
  document.body.append(shell);
  const enter = dialog.querySelector('.arcade-enter');
  let pending, current, marker, opener, timer, oldOverflow, returnAnchor=null, returnUntil=0, exitBusy = false, entering = false;
  const pauseAll = () => { pauseRunner(); pauseShooter(); };
  function prompt(panel, button) {
    pauseAll(); pending = panel; opener = button;
    const ta = document.documentElement.lang === 'ta';
    dialog.querySelector('h3').textContent = ta ? 'விளையாட இன்னும் கொஞ்சம் இடம்.' : 'A little more room to play.';
    dialog.querySelector('p').textContent = window.matchMedia('(pointer:coarse)').matches ? (ta ? 'கைப்பேசியைப் பக்கவாட்டில் திருப்பி, முழுத்திரையில் நுழையுங்கள்.' : 'Turn your phone sideways, then enter full screen.') : 'Keyboard ready? Enter full screen when you’re ready.';
    enter.textContent = ta ? 'முழுத்திரையில் நுழை ⛶' : 'Enter full screen ⛶';
    enter.disabled = true; clearTimeout(timer);
    dialog.showModal(); timer = setTimeout(() => { enter.disabled = false; }, 700);
  }
  dialog.querySelector('.arcade-prompt-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { clearTimeout(timer); opener?.focus({preventScroll:true}); });
  function orientationNote() { shell.querySelector('.arcade-orientation-note').hidden = !(current && window.matchMedia('(pointer:coarse) and (orientation:portrait)').matches); }
  async function leave() {
    if (!current || exitBusy) return;
    exitBusy = true; pauseAll();
    if (document.fullscreenElement === shell) { try { await document.exitFullscreen(); } catch {} }
    try { screen.orientation?.unlock?.(); } catch {}
    const returnPanel=current;marker.replaceWith(current); current = null; marker = null;
    shell.hidden = true; document.body.style.overflow = oldOverflow;
    document.querySelector('main').inert = false;
    returnAnchor=returnPanel;returnUntil=performance.now()+800;settleReturn();requestAnimationFrame(()=>requestAnimationFrame(settleReturn));setTimeout(settleReturn,180);opener?.focus({preventScroll:true});exitBusy=false;
  }
  enter.addEventListener('click', async () => {
    if (!pending || entering) return;
    entering = true; current = pending; pending = null;
    oldOverflow = document.body.style.overflow;
    marker = document.createComment('arcade game position'); current.before(marker);
    shell.querySelector('.arcade-screen-slot').append(current); shell.hidden = false;
    document.body.style.overflow = 'hidden'; document.querySelector('main').inert = true;
    dialog.close(); orientationNote();
    // Request immediately inside the click; a timed automatic request loses user activation.
    try { if (shell.requestFullscreen) await shell.requestFullscreen(); } catch { /* CSS full-window mode remains usable. */ }
    try { if (document.fullscreenElement === shell && matchMedia('(pointer:coarse)').matches) await screen.orientation?.lock?.('landscape'); } catch { /* Manual rotation remains available. */ }
    entering = false; orientationNote(); shell.querySelector('canvas')?.focus({preventScroll:true});if(current?.id==='runner-panel')window.showRunnerGuide();
  });
  shell.querySelector('.arcade-exit').onclick = leave;
  document.addEventListener('fullscreenchange', () => { if (current && !document.fullscreenElement && !entering) leave(); });
  function settleReturn(){if(returnAnchor&&performance.now()<returnUntil){window.scrollTo({top:Math.max(0,returnAnchor.getBoundingClientRect().top+window.scrollY-navigationBar.getBoundingClientRect().height-30),behavior:'instant'});highlightSection('play');}}
  window.addEventListener('resize',()=>{orientationNote();requestAnimationFrame(settleReturn);});
  ['wheel','touchstart'].forEach(type=>window.addEventListener(type,()=>{returnUntil=0;},{passive:true}));
  shell.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); leave(); }
    if (event.key === 'Tab') {
      const items = [...shell.querySelectorAll('button:not(:disabled),canvas[tabindex]')].filter(item => !item.closest('[hidden]'));
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  ['runner', 'shooter'].forEach(game => {
    const panel = document.getElementById(game + '-panel');
    panel.style.setProperty('--game-ratio', game === 'runner' ? 720 / 260 : game === 'shooter' ? 720 / 320 : 2);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'arcade-fullscreen-button'; button.textContent = 'Play full screen ⛶';
    button.onclick = () => prompt(panel, button); panel.querySelector('.runner-controls').append(button);
  });
  const aiming = document.createElement('div'); aiming.className = 'radar-aim-controls'; aiming.setAttribute('role','group'); aiming.setAttribute('aria-label','Aim radar');
  [['◀',-18,0,'Aim left'],['▲',0,-18,'Aim up'],['▼',0,18,'Aim down'],['▶',18,0,'Aim right']].forEach(([label,dx,dy,name]) => {
    const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-label',name);
    let repeat;
    const stop=()=>{clearInterval(repeat);repeat=null;};
    button.addEventListener('pointerdown',event=>{event.preventDefault();stop();button.setPointerCapture(event.pointerId);nudgeRadar(dx,dy);repeat=setInterval(()=>nudgeRadar(dx,dy),70);});
    ['pointerup','pointercancel','lostpointercapture','blur'].forEach(type=>button.addEventListener(type,stop));
    button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();nudgeRadar(dx,dy);}});
    aiming.append(button);
  });
  document.querySelector('#shooter-panel .runner-controls').prepend(aiming);
  const runnerPanel=document.getElementById('runner-panel');
  runnerDuck.parentElement.insertBefore(runnerDuck,runnerAction);
  const guide=document.createElement('div');guide.className='runner-guide';guide.setAttribute('role','region');guide.setAttribute('aria-label','Rover Run instructions');
  guide.innerHTML='<div class="runner-guide-card"><span class="runner-guide-eyebrow">ROVER RUN</span><h3>Left to duck. Right to jump.</h3><div class="runner-guide-sides"><p><strong>◀ LEFT</strong><span>Hold to duck under aircraft</span></p><p><strong>RIGHT ▶</strong><span>Tap to jump over trucks</span></p></div><p class="runner-guide-keyboard">Keyboard: ← duck · → or Space jump</p><div><button class="runner-guide-go" type="button">Let’s run ▶</button><button class="runner-guide-full" type="button">Full screen ⛶</button></div></div>';
  runnerPanel.append(guide);guide.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.code))event.stopPropagation();});
  window.showRunnerGuide=()=>{pauseRunner();guide.hidden=false;guide.querySelector('.runner-guide-go').focus({preventScroll:true});};
  guide.querySelector('.runner-guide-go').onclick=()=>{guide.hidden=true;runnerInput();runnerCanvas.focus({preventScroll:true});};
  guide.querySelector('.runner-guide-full').onclick=()=>runnerPanel.querySelector('.arcade-fullscreen-button').click();
  const help=document.createElement('button');help.type='button';help.className='arcade-help-button';help.textContent='How to play';help.onclick=window.showRunnerGuide;runnerPanel.querySelector('.runner-controls').append(help);
  guide.hidden=true;
})();

