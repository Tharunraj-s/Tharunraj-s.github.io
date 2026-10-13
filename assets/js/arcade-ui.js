/* Full-screen arcade mode. Every entry is explicitly requested by the visitor. */
(() => {
  let loading;
  window.loadOmaGame = () => {
    if (window.omaGame) { window.omaGame.draw(); return Promise.resolve(); }
    if (!loading) loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './assets/js/one-more-attempt.js?v=20261013-arcade';
      script.onload = resolve;
      script.onerror = () => { loading = null; document.getElementById('oma-status').textContent = 'The lab is taking a moment. Select the game again to retry.'; script.remove(); reject(new Error('Game download failed')); };
      document.body.append(script);
    });
    return loading.catch(() => {});
  };
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
  let pending, current, marker, opener, timer, oldOverflow, oldScroll, exitBusy = false, entering = false;
  const pauseAll = () => { pauseRunner(); pauseShooter(); window.omaGame?.pause(); };
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
  dialog.addEventListener('close', () => { clearTimeout(timer); opener?.focus(); });
  function orientationNote() { shell.querySelector('.arcade-orientation-note').hidden = !(current && window.matchMedia('(pointer:coarse) and (orientation:portrait)').matches); }
  async function leave() {
    if (!current || exitBusy) return;
    exitBusy = true; pauseAll();
    if (document.fullscreenElement === shell) { try { await document.exitFullscreen(); } catch {} }
    try { screen.orientation?.unlock?.(); } catch {}
    marker.replaceWith(current); current = null; marker = null;
    shell.hidden = true; document.body.style.overflow = oldOverflow;
    document.querySelector('main').inert = false;
    window.scrollTo({ top: oldScroll, behavior: 'instant' }); opener?.focus(); exitBusy = false;
  }
  enter.addEventListener('click', async () => {
    if (!pending || entering) return;
    entering = true; current = pending; pending = null;
    oldOverflow = document.body.style.overflow; oldScroll = window.scrollY;
    marker = document.createComment('arcade game position'); current.before(marker);
    shell.querySelector('.arcade-screen-slot').append(current); shell.hidden = false;
    document.body.style.overflow = 'hidden'; document.querySelector('main').inert = true;
    dialog.close(); orientationNote();
    // Request immediately inside the click; a timed automatic request loses user activation.
    try { if (shell.requestFullscreen) await shell.requestFullscreen(); } catch { /* CSS full-window mode remains usable. */ }
    try { if (document.fullscreenElement === shell && matchMedia('(pointer:coarse)').matches) await screen.orientation?.lock?.('landscape'); } catch { /* Manual rotation remains available. */ }
    entering = false; orientationNote(); shell.querySelector('canvas')?.focus();
  });
  shell.querySelector('.arcade-exit').onclick = leave;
  document.addEventListener('fullscreenchange', () => { if (current && !document.fullscreenElement && !entering) leave(); });
  window.addEventListener('resize', orientationNote);
  shell.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); leave(); }
    if (event.key === 'Tab') {
      const items = [...shell.querySelectorAll('button:not(:disabled),canvas[tabindex]')].filter(item => !item.closest('[hidden]'));
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  ['runner', 'shooter', 'oma'].forEach(game => {
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
})();
