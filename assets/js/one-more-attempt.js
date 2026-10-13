/* One More Attempt — original, lazy-loaded canvas platformer. No network services. */
(() => {
  'use strict';
  const canvas=document.getElementById('oma-canvas'),ctx=canvas.getContext('2d'),panel=document.getElementById('oma-panel');
  const status=document.getElementById('oma-status'),startButton=document.getElementById('oma-start'),pauseButton=document.getElementById('oma-pause'),bestNode=document.getElementById('oma-best');
  const W=960,H=480,worldWidth=2640,keys=new Set(),pointerMoves=new Map();
  let state='ready',level=0,player,platforms,parts,batteries,robots,checkpoint=40,lives=3,collected=0,runParts=0,best=0,camera=0,powered=0,frozen=0,cooldown=0,invulnerable=0,time=0,frame=0,last=0,jumpBuffer=0,coyote=0,charges=2,message='It worked perfectly yesterday.',messageTime=0;
  try { best=Math.max(0,Number(localStorage.getItem('portfolio-oma-best'))||0); } catch {}
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const palette={hair:'#241b1b',skin:'#e9aa70',jacket:'#4982cf',dark:'#132943',boot:'#111a28',white:'#e8eff9',cyan:'#60e9ef',gold:'#f1ba65'};
  const sprite=['   HHHHHH   ','  HHHHHHHH  ',' HHSSSSHHHH ','  SWSWSSHH  ','  SSSSSSH   ','   SSSSS    ','  BBBBBBS   ',' SBBBBBBBS  ',' SBBBBBBBS  ','  BBBBBBB   ','  BBBBBBB   ','   DDDDD    ','   DD DD    ','   DD DD    ','  KKK KKK   '];
  const spriteColors={H:palette.hair,S:palette.skin,W:palette.white,B:palette.jacket,D:palette.dark,K:palette.boot};
  function say(text){message=text;messageTime=3;}
  function saveBest(){const score=runParts;if(score>best){best=score;try{localStorage.setItem('portfolio-oma-best',String(best));}catch{}}}
  function makeLevel(n=0){
    level=n;checkpoint=40;camera=0;collected=0;charges=2;powered=frozen=cooldown=invulnerable=0;jumpBuffer=coyote=0;
    player={x:40,y:350,w:26,h:40,vx:0,vy:0,facing:1,grounded:false};
    platforms=[{x:0,y:400,w:680,h:80},{x:820,y:400,w:670,h:80},{x:1630,y:400,w:1010,h:80},
      {x:150,y:320,w:135,h:18},{x:340,y:245,w:140,h:18},{x:540,y:310,w:125,h:18},{x:690,y:330,w:110,h:18},
      {x:930,y:315,w:130,h:18},{x:1130,y:245,w:130,h:18},{x:1350,y:315,w:125,h:18},{x:1490,y:330,w:120,h:18},
      {x:1740,y:315,w:135,h:18},{x:1940,y:240,w:140,h:18},{x:2145,y:310,w:125,h:18},{x:2370,y:320,w:125,h:18}];
    if(n===1){platforms[4].y=295;platforms[7].y=300;platforms[10].y=300;}
    if(n===2){platforms[3].y=305;platforms[6].y=315;platforms[11].y=230;}
    parts=platforms.slice(3).map((p,i)=>({x:p.x+p.w/2-9,y:p.y-35,w:18,h:18,taken:false,i}));
    batteries=[{x:870,y:359,w:18,h:29,taken:false},{x:1670,y:359,w:18,h:29,taken:false}];
    robots=[{x:390,y:366,w:29,h:34,left:305,right:615,dir:1,alive:true},{x:1060,y:366,w:29,h:34,left:840,right:1440,dir:-1,alive:true},{x:1880,y:366,w:29,h:34,left:1650,right:2180,dir:1,alive:true},{x:2420,y:366,w:29,h:34,left:2230,right:2530,dir:-1,alive:true}];
    time=0;say(n===0?'It worked perfectly yesterday.':n===1?'They updated the robots. Nobody asked me.':'Last lab. Absolutely intentional.');
    updateLabels();draw();
  }
  function updateLabels(){
    const text=state==='ready'?'Collect 8 of 12 parts, find batteries, and reach the exit.':state==='paused'?'Paused. Your experiments can wait.':state==='over'?'The lab won this round. One more attempt?':state==='won'?'Three labs escaped. Definitely part of the plan.':messageTime>0?message:'Arrows / A D: move · Space: jump · E: freeze the robots.';
    if(status.textContent!==text)status.textContent=text;
    const start=state==='running'?'Restart adventure':state==='paused'?'Resume':state==='won'||state==='over'?'One more attempt':'Start adventure';
    if(startButton.textContent!==start)startButton.textContent=start;
    pauseButton.disabled=state!=='running';
    const label='Best '+best+' parts';if(bestNode.textContent!==label)bestNode.textContent=label;
    document.getElementById('oma-gadget').disabled=state!=='running'||charges===0||cooldown>0;
    document.getElementById('oma-jump').disabled=state!=='running';
  }
  function clearInput(){keys.clear();pointerMoves.clear();jumpBuffer=0;}
  function pause(){clearInput();if(state!=='running')return;state='paused';cancelAnimationFrame(frame);last=0;updateLabels();draw();}
  function start(){
    cancelAnimationFrame(frame);clearInput();
    if(state!=='paused'){lives=3;runParts=0;makeLevel(0);}
    state='running';last=0;updateLabels();canvas.focus({preventScroll:true});frame=requestAnimationFrame(tick);
  }
  function hurt(){
    if(invulnerable>0)return;
    lives--;powered=0;clearInput();
    if(lives<=0){state='over';saveBest();say('A perfectly planned unplanned ending.');return;}
    player.x=checkpoint;player.y=350;player.vy=player.vx=0;invulnerable=2;
    say('Checkpoint. We’ll call that a field test.');
  }
  function requestJump(){if(state==='running')jumpBuffer=.14;}
  function gadget(){
    if(state!=='running'||cooldown>0||charges<=0)return;
    charges--;frozen=3;cooldown=4;say('Please hold. Your robots are buffering.');updateLabels();
  }
  function step(dt){
    time+=dt;powered=Math.max(0,powered-dt);frozen=Math.max(0,frozen-dt);cooldown=Math.max(0,cooldown-dt);invulnerable=Math.max(0,invulnerable-dt);messageTime=Math.max(0,messageTime-dt);
    jumpBuffer=Math.max(0,jumpBuffer-dt);coyote=player.grounded?.1:Math.max(0,coyote-dt);
    const left=keys.has('ArrowLeft')||keys.has('KeyA')||[...pointerMoves.values()].includes(-1),right=keys.has('ArrowRight')||keys.has('KeyD')||[...pointerMoves.values()].includes(1);
    player.vx=((right?1:0)-(left?1:0))*250;if(player.vx)player.facing=Math.sign(player.vx);
    if(jumpBuffer>0&&coyote>0){player.vy=-655;player.grounded=false;coyote=jumpBuffer=0;}
    const previousBottom=player.y+player.h;
    player.x=Math.max(0,Math.min(worldWidth-player.w,player.x+player.vx*dt));
    player.vy=Math.min(900,player.vy+1700*dt);player.y+=player.vy*dt;player.grounded=false;
    for(const p of platforms){if(player.vy>=0&&previousBottom<=p.y+2&&player.y+player.h>=p.y&&player.x+player.w>p.x+2&&player.x<p.x+p.w-2){player.y=p.y-player.h;player.vy=0;player.grounded=true;break;}}
    if(player.y>H+40){hurt();if(state!=='running')return;}
    for(const part of parts){if(!part.taken&&overlap(player,part)){part.taken=true;collected++;runParts++;saveBest();if(collected===8)say('Eight parts. The exit is finally cooperating.');}}
    for(const battery of batteries){if(!battery.taken&&overlap(player,battery)){battery.taken=true;powered=8;charges=Math.min(3,charges+1);say('Your turn to chase the robots.');}}
    for(const robot of robots){
      if(!robot.alive)continue;
      if(!frozen){const delta=player.x-robot.x;const close=Math.abs(delta)<190&&Math.abs(player.y-robot.y)<90;robot.dir=close?Math.sign(delta)||robot.dir:robot.dir;robot.x+=robot.dir*(close?105+level*15:65+level*12)*dt;if(robot.x<=robot.left){robot.x=robot.left;robot.dir=1;}if(robot.x>=robot.right){robot.x=robot.right;robot.dir=-1;}}
      if(overlap(player,robot)){
        if(powered>0||player.vy>50&&previousBottom<=robot.y+12){robot.alive=false;player.vy=-330;say('Absolutely intentional.');}
        else hurt();
      }
    }
    if(player.grounded&&player.x>860&&checkpoint<860){checkpoint=850;say('Checkpoint saved. A rare responsible decision.');}
    if(player.grounded&&player.x>1670&&checkpoint<1670){checkpoint=1660;say('Checkpoint. Nearly out of your own mess.');}
    if(player.x>2540&&collected>=8){
      saveBest();if(level<2){makeLevel(level+1);lives=Math.min(3,lives+1);}
      else {state='won';say('Escaped. The lab can debug itself.');}
    }else if(player.x>2500&&collected<8&&messageTime<=0)say('The door wants 8 parts. Apparently it has standards.');
    camera=Math.max(0,Math.min(worldWidth-W,player.x-W*.38));updateLabels();
  }
  function tick(now){if(state!=='running')return;const dt=Math.min((now-(last||now))/1000,.025);last=now;step(dt);draw();if(state==='running')frame=requestAnimationFrame(tick);}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  function gear(x,y,small=false){const r=small?8:10;ctx.fillStyle=palette.gold;for(let i=0;i<8;i++){ctx.save();ctx.translate(x,y);ctx.rotate(i*Math.PI/4);ctx.fillRect(-3,-r-3,6,6);ctx.restore();}ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#152536';ctx.beginPath();ctx.arc(x,y,r*.45,0,Math.PI*2);ctx.fill();}
  function background(){
    rect(0,0,W,H,'#0b192c');rect(0,125,W,230,'#102b48');
    const drift=camera*.25;
    for(let i=-1;i<8;i++){const x=i*190-(drift%190);rect(x,38,160,243,'#183752');rect(x+5,45,150,228,'#102740');rect(x+78,45,4,228,'#284860');rect(x+5,142,150,4,'#284860');
      for(let j=0;j<4;j++){const tx=x+15+j*34;rect(tx,215-j%2*33,23,55+j%2*33,'#16314b');rect(tx+7,226-j%2*33,4,5,'#345c70');}
      rect(x+45,282,58,65,'#203947');rect(x+52,289,44,23,'#13263b');rect(x+55,295,27,3,'#418d9c');rect(x+109,319,27,28,'#34434f');
    }
    for(let i=0;i<6;i++){const x=i*230-(camera*.4%230);rect(x,8,9,108,'#314652');rect(x-8,112,25,9,'#d1a252');rect(x-14,122,38,3,'#795d34');rect(x+50,0,7,65,'#16232e');rect(x+47,62,20,25,'#263949');}
    rect(0,0,W,7,'#203440');rect(0,436,W,44,'#092e37');
    for(let x=0;x<W;x+=28){rect(x,445+(x%3)*5,17,2,'#206372');rect(x+4,459,11,2,'#194e60');}
  }
  function inventor(){
    if(invulnerable>0&&Math.floor(time*12)%2)return;
    ctx.save();ctx.translate(Math.round(player.x-camera+player.w/2),Math.round(player.y));ctx.scale(player.facing,1);
    if(powered>0){ctx.strokeStyle=palette.cyan;ctx.lineWidth=2;ctx.strokeRect(-17,-3,34,46);}
    sprite.forEach((row,y)=>[...row].forEach((c,x)=>{if(spriteColors[c])rect((x-6)*2,y*2,2,2,spriteColors[c]);}));
    // Blue work jacket, goggles and a small original inventor gadget.
    rect(-4,4,12,3,'#75c3d0');rect(8,17,5,8,'#7ad3de');rect(7,16,6,3,'#c0d4cf');
    const stride=player.grounded&&player.vx?Math.sin(time*18)*3:0;rect(-6,30+stride,6,6,palette.boot);rect(4,30-stride,6,6,palette.boot);ctx.restore();
  }
  function draw(){
    ctx.imageSmoothingEnabled=false;background();
    for(const p of platforms){const x=p.x-camera;if(x+p.w<0||x>W)continue;rect(x,p.y,p.w,p.h,'#263947');rect(x,p.y,p.w,5,'#70818b');rect(x,p.y+5,p.w,5,'#142631');for(let k=10;k<p.w;k+=36){rect(x+k,p.y+7,4,3,'#93a0a5');if(p.h<30)rect(x+k+10,p.y+12,14,4,'#b29450');}if(p.h<30){rect(x+17,p.y+p.h,6,80,'#172b39');rect(x+p.w-25,p.y+p.h,6,80,'#172b39');}}
    for(const part of parts)if(!part.taken&&part.x-camera>-30&&part.x-camera<W+30)gear(part.x-camera+9,part.y+9+Math.sin(time*3+part.i)*3);
    for(const battery of batteries)if(!battery.taken){const x=battery.x-camera;rect(x+4,battery.y-3,10,3,'#d1eef0');rect(x,battery.y,18,29,'#22596b');rect(x+3,battery.y+3,12,22,palette.cyan);rect(x+8,battery.y+9,4,7,'#f2ffff');}
    for(const x of [850,1660]){rect(x-camera,350,4,50,'#64808a');rect(x-camera+4,350,25,15,checkpoint>=x?'#69c5b4':'#465c76');}
    for(const robot of robots){if(!robot.alive)continue;const x=robot.x-camera,y=robot.y;rect(x+4,y,21,4,'#ddc49f');rect(x,y+4,29,23,frozen?'#5489a0':'#bca98b');rect(x+4,y+7,21,14,'#192935');rect(x+9,y+11,4,6,powered?'#6fd5ed':'#f4bc61');rect(x+18,y+11,4,6,powered?'#6fd5ed':'#f4bc61');rect(x+4,y+27,6,7,'#7e8a90');rect(x+20,y+27,6,7,'#7e8a90');rect(x+14,y-7,2,7,'#84919c');rect(x+12,y-10,6,4,frozen?'#a4eff1':'#eeac58');}
    const exitX=2570-camera;rect(exitX-5,300,52,100,'#263e4b');rect(exitX,307,42,93,collected>=8?'#c29856':'#46566a');rect(exitX+5,313,32,87,collected>=8?'#edd08c':'#273e54');ctx.fillStyle=collected>=8?'#3c3530':'#a7bdd2';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('EXIT',exitX+21,340);
    inventor();
    rect(0,0,W,36,'#071320');ctx.font='bold 14px monospace';ctx.textAlign='left';ctx.fillStyle='#c9ddef';ctx.fillText('LAB '+(level+1)+' / 3',18,23);ctx.fillStyle=palette.gold;ctx.fillText('PARTS '+collected+' / 12',156,23);ctx.fillStyle='#e4a39a';ctx.fillText('♥'.repeat(Math.max(0,lives)),315,23);ctx.fillStyle=palette.cyan;ctx.fillText('GADGET '+charges+(cooldown>0?' · '+Math.ceil(cooldown)+'s':''),405,23);if(powered>0)ctx.fillText('POWER '+Math.ceil(powered)+'s',660,23);
    if(frozen>0){ctx.strokeStyle='#a4f0f2';ctx.lineWidth=3;ctx.strokeRect(3,38,W-6,H-41);}
    if(state!=='running'){
      ctx.fillStyle='rgba(4,13,25,.78)';ctx.fillRect(0,36,W,H-36);ctx.textAlign='center';ctx.fillStyle='#e6edf6';ctx.font='bold 32px monospace';ctx.fillText(state==='ready'?'ONE MORE ATTEMPT':state==='paused'?'EXPERIMENT PAUSED':state==='won'?'LAB ESCAPED.':'ONE MORE ATTEMPT?',W/2,185);
      ctx.font='16px monospace';ctx.fillStyle='#a8c0d9';ctx.fillText(state==='ready'?'Your inventions have gone rogue. Typical.':state==='paused'?'Press Resume or P when you’re ready.':state==='won'?'Three labs. One inventor. Zero accountability.':'It worked perfectly yesterday.',W/2,225);
      ctx.font='14px monospace';ctx.fillStyle=palette.gold;ctx.fillText(state==='ready'?'Collect 8 parts · reach EXIT · keep your three hearts':'Use the button below to continue.',W/2,264);
    }
  }
  startButton.addEventListener('click',start);pauseButton.addEventListener('click',pause);
  function active(){return !panel.hidden&&!document.hidden;}
  const controls=new Set(['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyW','Space','KeyE','KeyP']);
  panel.addEventListener('keydown',event=>{
    if(!active()||!controls.has(event.code)||event.target.matches('input,textarea'))return;
    if(event.target.tagName==='BUTTON'&&(event.code==='Space'||event.code==='KeyP'))return;
    event.preventDefault();keys.add(event.code);
    if(!event.repeat){if(['ArrowUp','KeyW','Space'].includes(event.code))requestJump();if(event.code==='KeyE')gadget();if(event.code==='KeyP'){if(state==='paused')start();else pause();}}
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  function moveButton(id,direction){const b=document.getElementById(id);b.addEventListener('pointerdown',event=>{event.preventDefault();b.setPointerCapture(event.pointerId);pointerMoves.set(event.pointerId,direction);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>b.addEventListener(type,event=>pointerMoves.delete(event.pointerId)));}
  moveButton('oma-left',-1);moveButton('oma-right',1);
  document.getElementById('oma-jump').addEventListener('pointerdown',event=>{event.preventDefault();requestJump();});
  document.getElementById('oma-jump').addEventListener('click',event=>{if(event.detail===0)requestJump();});
  document.getElementById('oma-gadget').addEventListener('click',gadget);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pause();},{threshold:.05}).observe(canvas);
  function reset(){cancelAnimationFrame(frame);clearInput();state='ready';lives=3;runParts=0;best=0;try{localStorage.removeItem('portfolio-oma-best');}catch{}makeLevel(0);updateLabels();draw();}
  window.omaGame={pause,reset,draw};makeLevel(0);updateLabels();
})();
