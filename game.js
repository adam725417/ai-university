(() => {
  const cfg = window.APP_CONFIG;
  const levels = window.GAME_LEVELS;
  const answerKey = window.ANSWER_KEY;
  const $ = s => document.querySelector(s);
  const app = $('#app');
  const toast = $('#toast');

  // Academic context is carried silently in the URL so the student UI stays identical to v2.
  function findAcademicContext(){
    const catalog=Array.isArray(cfg.academicCatalog)?cfg.academicCatalog:[];
    const params=new URLSearchParams(location.search);
    const def=cfg.defaultAcademicContext||{};
    const termId=params.get('term')||params.get('termId')||def.termId||catalog[0]?.id||'';
    const term=catalog.find(t=>t.id===termId)||catalog[0]||{id:termId,label:termId,courses:[]};
    const courseId=params.get('course')||params.get('courseId')||def.courseId||term.courses?.[0]?.id||'';
    const course=(term.courses||[]).find(c=>c.id===courseId)||term.courses?.[0]||{id:courseId,label:cfg.courseLabel||courseId,classes:[]};
    const classId=params.get('class')||params.get('classId')||def.classId||course.classes?.[0]?.id||'';
    const cls=(course.classes||[]).find(c=>c.id===classId)||course.classes?.[0]||{id:classId,label:classId};
    return {termId:term.id||termId,termLabel:term.label||termId,courseId:course.id||courseId,courseLabel:course.label||cfg.courseLabel||courseId,classId:cls.id||classId,classLabel:cls.label||classId};
  }
  const academic=findAcademicContext();
  const storageSuffix=[academic.termId,academic.courseId,academic.classId].map(x=>encodeURIComponent(x||'default')).join(':');
  const autosaveKey=`${cfg.autosaveKey}:${storageSuffix}`;
  const state = {
    name:'', answers:{}, currentScreen:'welcome', currentLevel:0, quizIndex:{}, quizLocked:{},
    xp:0, combo:0, completedLevels:[], startedAt:null, submitted:false
  };

  const heroAssets = {
    survival:'assets/lv1-hero.jpg', gear:'assets/lv2-hero.jpg', arena:'assets/lv3-hero.jpg',
    mission:'assets/lv4-hero.jpg', boss:'assets/boss-hero.jpg'
  };

  function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1900)}
  function save(){try{localStorage.setItem(autosaveKey,JSON.stringify(state))}catch{}}
  function restore(){try{const raw=localStorage.getItem(autosaveKey);if(raw){Object.assign(state,JSON.parse(raw));return true}}catch{}return false}
  function recalcXp(){let xp=0;Object.entries(state.answers).forEach(([id,v])=>{if(v!==undefined&&v!==''&&!(Array.isArray(v)&&!v.length)) xp+=10;if(answerKey[id]&&v===answerKey[id]) xp+=40});state.xp=Math.min(cfg.maxXp,xp)}
  function doneCount(){return new Set(state.completedLevels).size}

  function hudOverlay(extraClass=''){
    const done=doneCount();
    return `<div class="real-hud ${extraClass}"><div class="hud-card player-card"><div class="hud-line"><span class="hud-name">👤 ${esc(state.name||'探索者')}</span></div><div class="hud-divider"></div><div class="hud-xp">⭐ ${state.xp} XP</div></div><div class="hud-card progress-card"><div class="hud-line"><span class="mini-status">已完成 ${done} / ${levels.length} 關</span></div><div class="mini-track"><i style="width:${Math.min(100,done/levels.length*100)}%"></i></div></div></div>`;
  }
  function progress(){const done=doneCount();return `<div class="progress-strip"><b>探索進度 ${done}/${levels.length}</b><div class="progress-track"><i style="width:${done/levels.length*100}%"></i></div><b>⭐ ${state.xp} XP</b></div>`}
  function imageArt(src, cls='', hud=true, alt='AI University 遊戲插圖'){return `<div class="art-frame ${cls}"><img src="${src}" alt="${esc(alt)}">${hud?hudOverlay():''}</div>`}

  function welcome(){
    state.currentScreen='welcome'; save(); recalcXp();
    app.innerHTML=`<section class="screen">
      ${imageArt('assets/welcome-hero.jpg','welcome-art',false,'歡迎來到 AI University 校園')}
      <div class="welcome-panel">
        <div class="welcome-intro"><span class="avatar-dot">👤</span><div><b>請輸入你的姓名</b><div class="helper">準備好就開始今天的 AI 探索任務。</div></div></div>
        <input id="nameInput" class="name-input" placeholder="例如：王小明" maxlength="30" value="${esc(state.name)}" autocomplete="name" />
        <button id="startBtn" class="primary-btn">開始我的 AI 探索 →</button>
        <div class="tiny-note">⏱ 約 10–15 分鐘・沒有標準答案・安心探索</div>
        <div class="level-previews">${levels.map(l=>`<div class="level-preview"><b>${l.icon}</b><span>Lv.${l.level}</span><br>${esc(l.title.replace('Final Boss：',''))}</div>`).join('')}</div>
      </div>
    </section>`;
    $('#nameInput').addEventListener('input',e=>{state.name=e.target.value.trim();save()});
    $('#startBtn').addEventListener('click',()=>{const n=$('#nameInput').value.trim();if(!n){showToast('先留下你的姓名吧！');return}state.name=n;state.startedAt=state.startedAt||new Date().toISOString();state.currentScreen='map';save();mapScreen()});
  }

  function mapScreen(){
    state.currentScreen='map'; save(); recalcXp();
    const next=levels.findIndex(l=>!state.completedLevels.includes(l.id));
    const hotspots=levels.map((l,i)=>{
      const done=state.completedLevels.includes(l.id);
      const unlocked=i===0||levels.slice(0,i).every(x=>state.completedLevels.includes(x.id));
      const current=i===next;
      return `<button class="map-hotspot map-${i+1} ${done?'done':''} ${current?'current':''} ${!unlocked?'locked':''}" data-level="${i}" data-unlocked="${unlocked}" aria-label="Lv.${l.level} ${esc(l.title)}"></button>`;
    }).join('');
    app.innerHTML=`<section class="screen">
      <div class="map-shell"><img src="assets/map-full.jpg" alt="AI University 世界地圖">${hudOverlay('map-hud')}${hotspots}</div>
      <div class="map-footer"><button class="ghost-btn" id="homeBtn">← 返回首頁</button><button class="primary-btn" id="continueBtn">前往目前關卡 →</button></div>
    </section>`;
    document.querySelectorAll('[data-level]').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.unlocked!=='true'){showToast('先完成前一關才能解鎖喔！');return}state.currentLevel=Number(el.dataset.level);levelScreen(state.currentLevel)}));
    $('#homeBtn').addEventListener('click',welcome);
    $('#continueBtn').addEventListener('click',()=>{const target=next<0?levels.length-1:next;state.currentLevel=target;levelScreen(target)});
  }

  function stageHead(level){
    return `<div class="stage-wrap accent-${level.accent}">${imageArt(heroAssets[level.id],`stage-art ${level.id==='boss'?'boss-art':''}`,true,`${level.title} 關卡插圖`)}<div class="stage-caption"><span class="kicker">Lv.${level.level} ${level.icon}</span><h1>${esc(level.title)}</h1><p>${esc(level.intro)}</p></div></div>${progress()}`;
  }
  function answerComplete(q){const v=state.answers[q.id];if(!q.required)return true;if(Array.isArray(v))return v.length>0;return v!==undefined&&v!==null&&String(v).trim()!==''}
  function levelComplete(level){return level.questions.every(answerComplete)}

  function levelScreen(idx){state.currentScreen='level';state.currentLevel=idx;save();const level=levels[idx];if(level.id==='arena'||level.id==='mission'){quizLevel(level,idx);return}if(level.id==='boss'){bossLevel(level,idx);return}app.innerHTML=`<section class="screen">${stageHead(level)}${level.questions.map((q,i)=>renderQuestion(q,i)).join('')}${levelActions(level,idx)}</section>`;bindQuestionEvents(level)}

  function renderQuestion(q,i){
    if(q.type==='single'){
      return `<div class="question-card"><div class="q-kicker">MISSION ${i+1}</div><div class="q-title">${esc(q.label)}</div><div class="option-grid">${q.options.map(o=>{const obj=typeof o==='string'?{value:o,title:o,icon:'✨'}:o;const selected=state.answers[q.id]===obj.value;return `<button class="option-card ${selected?'selected':''}" data-single="${q.id}" data-value="${esc(obj.value)}"><span class="check-dot"></span><span class="option-icon">${obj.icon||'✨'}</span><span class="option-title">${esc(obj.title)}</span>${obj.desc?`<div class="option-desc">${esc(obj.desc)}</div>`:''}</button>`}).join('')}</div>${q.allowOther?`<div class="other-wrap"><input class="name-input" data-other="${q.id}" placeholder="其他想法（選填）" value="${esc((state.answers[q.id]||'').startsWith('其他：')?state.answers[q.id].slice(3):'')}" /></div>`:''}</div>`;
    }
    if(q.type==='multi-cards'){
      const selected=Array.isArray(state.answers[q.id])?state.answers[q.id]:[];
      return `<div class="question-card"><div class="q-kicker">🎒 裝備任務</div><div class="q-title">${esc(q.label)}</div><div class="multi-grid">${q.options.map(([name,desc,icon])=>`<div class="gear-card ${selected.includes(name)?'selected':''}" data-multi="${q.id}" data-value="${esc(name)}"><div class="gear-icon">${icon}</div><div class="gear-name">${esc(name)}</div><div class="gear-desc">${esc(desc)}</div><span class="equip-badge">👑 已裝備</span></div>`).join('')}</div>${q.allowOther?`<div class="other-wrap"><input class="name-input" data-multi-other="${q.id}" placeholder="其他裝備（選填）" /></div>`:''}<p class="helper">✨ 目前裝備：${selected.length} 項。點一下卡片就能裝備／卸下。</p></div>`;
    }
    if(q.type==='scale'){
      const v=Number(state.answers[q.id]||0);
      return `<div class="scale-card"><div class="scale-title">⚡ ${esc(q.label)}</div><div class="scale-prompt">${esc(q.prompt)}</div><div class="scale-buttons">${[1,2,3,4,5].map(n=>`<button class="scale-btn ${v===n?'selected':''}" data-scale="${q.id}" data-value="${n}">${n}</button>`).join('')}</div><div class="scale-labels"><span>${esc(q.minLabel)}</span><span>${esc(q.maxLabel)}</span></div></div>`;
    }
    return '';
  }

  function bindQuestionEvents(level){
    document.querySelectorAll('[data-single]').forEach(btn=>btn.addEventListener('click',()=>{state.answers[btn.dataset.single]=btn.dataset.value;recalcXp();save();levelScreen(state.currentLevel)}));
    document.querySelectorAll('[data-other]').forEach(inp=>inp.addEventListener('change',()=>{if(inp.value.trim())state.answers[inp.dataset.other]='其他：'+inp.value.trim();recalcXp();save()}));
    document.querySelectorAll('[data-multi]').forEach(card=>card.addEventListener('click',()=>{const id=card.dataset.multi;const arr=Array.isArray(state.answers[id])?[...state.answers[id]]:[];const v=card.dataset.value;const p=arr.indexOf(v);p>=0?arr.splice(p,1):arr.push(v);state.answers[id]=arr;recalcXp();save();levelScreen(state.currentLevel)}));
    document.querySelectorAll('[data-multi-other]').forEach(inp=>inp.addEventListener('change',()=>{const id=inp.dataset.multiOther;let arr=Array.isArray(state.answers[id])?[...state.answers[id]]:[];arr=arr.filter(x=>!String(x).startsWith('其他：'));if(inp.value.trim())arr.push('其他：'+inp.value.trim());state.answers[id]=arr;recalcXp();save()}));
    document.querySelectorAll('[data-scale]').forEach(btn=>btn.addEventListener('click',()=>{state.answers[btn.dataset.scale]=Number(btn.dataset.value);recalcXp();save();levelScreen(state.currentLevel)}));
    bindLevelActions(level);
  }

  function levelActions(level,idx){return `<div class="level-actions"><button class="ghost-btn" id="mapBtn">🗺️ 地圖</button><button class="primary-btn" id="nextLevelBtn">${idx===levels.length-1?'完成 Final Boss':'完成本關，前往下一關'} →</button></div>`}
  function bindLevelActions(level){$('#mapBtn')?.addEventListener('click',mapScreen);$('#nextLevelBtn')?.addEventListener('click',()=>finishLevel(level))}
  function finishLevel(level){if(!levelComplete(level)){showToast('還有必答任務尚未完成！');return}if(!state.completedLevels.includes(level.id))state.completedLevels.push(level.id);recalcXp();save();const idx=levels.findIndex(l=>l.id===level.id);if(idx===levels.length-1)completeScreen();else{state.currentLevel=idx+1;levelScreen(idx+1)}}

  function quizLevel(level,idx){
    const qIndex=state.quizIndex[level.id]??0;
    const q=level.questions[qIndex];
    if(!q){finishLevel(level);return}
    if(q.type!=='quiz'){
      app.innerHTML=`<section class="screen">${stageHead(level)}${renderQuestion(q,qIndex)}${levelActions(level,idx)}</section>`;
      bindQuestionEvents(level);return;
    }
    const selected=state.answers[q.id];const locked=!!state.quizLocked[q.id];const isCorrect=selected===q.answer;
    app.innerHTML=`<section class="screen">${stageHead(level)}<div class="question-card"><div class="quiz-meta"><b>📖 第 ${qIndex+1} 題 / 共 ${level.questions.length} 題</b><span class="combo">🔥 COMBO × ${state.combo}</span></div><div class="q-title">${esc(q.label)}</div><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option ${selected===o?'selected':''} ${locked&&o===q.answer?'correct':''} ${locked&&selected===o&&o!==q.answer?'wrong':''}" data-quiz-value="${esc(o)}" ${locked?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><b>${esc(o)}</b></button>`).join('')}</div><div class="feedback ${locked?'show':''} ${isCorrect?'good':'learn'}">${locked?(isCorrect?'⭐ 答對！':'💡 解鎖新知！')+' '+esc(q.explain):''}</div></div><div class="level-actions"><button class="ghost-btn" id="mapBtn">🗺️ 地圖</button><button class="primary-btn" id="quizNext" ${locked?'':'disabled'}>${qIndex===level.questions.length-1?'完成本關':'下一題'} →</button></div></section>`;
    document.querySelectorAll('[data-quiz-value]').forEach(btn=>btn.addEventListener('click',()=>{if(state.quizLocked[q.id])return;state.answers[q.id]=btn.dataset.quizValue;state.quizLocked[q.id]=true;if(btn.dataset.quizValue===q.answer)state.combo+=1;else state.combo=0;recalcXp();save();quizLevel(level,idx)}));
    $('#mapBtn').addEventListener('click',mapScreen);
    $('#quizNext').addEventListener('click',()=>{state.quizIndex[level.id]=qIndex+1;save();if(qIndex+1>=level.questions.length){if(!state.completedLevels.includes(level.id))state.completedLevels.push(level.id);state.combo=0;recalcXp();save();if(idx+1<levels.length){state.currentLevel=idx+1;levelScreen(idx+1)}else completeScreen()}else quizLevel(level,idx)});
  }

  function bossLevel(level,idx){
    const tagQ=level.questions[0],textQ=level.questions[1];
    const tags=Array.isArray(state.answers[tagQ.id])?state.answers[tagQ.id]:[];
    const text=state.answers[textQ.id]||'';
    app.innerHTML=`<section class="screen">${stageHead(level)}<div class="boss-card"><h2 class="wish-title">🔮 AI 願望機</h2><p class="wish-sub">最後一關沒有標準答案。把你真正想用 AI 解決的事情投入願望機。</p><div class="pills">${tagQ.options.map(o=>`<button class="pill ${tags.includes(o)?'selected':''}" data-wish-tag="${esc(o)}">${esc(o)}</button>`).join('')}</div><div style="height:14px"></div><label class="field-label">💬 寫下你的 AI 願望</label><textarea id="wishText" class="textarea" maxlength="${textQ.maxLength}" placeholder="${esc(textQ.placeholder)}">${esc(text)}</textarea><div class="char-count"><span id="charCount">${text.length}</span> / ${textQ.maxLength}</div><div class="boss-tip"><span>⭐</span><div><b>你的想法很重要！</b><br>老師會從全班的願望，看見大家最想學會的 AI 應用方向。</div></div></div>${levelActions(level,idx)}</section>`;
    document.querySelectorAll('[data-wish-tag]').forEach(btn=>btn.addEventListener('click',()=>{let arr=Array.isArray(state.answers[tagQ.id])?[...state.answers[tagQ.id]]:[];const v=btn.dataset.wishTag;arr.includes(v)?arr=arr.filter(x=>x!==v):arr.push(v);state.answers[tagQ.id]=arr;recalcXp();save();bossLevel(level,idx)}));
    $('#wishText').addEventListener('input',e=>{state.answers[textQ.id]=e.target.value.trim();$('#charCount').textContent=e.target.value.length;recalcXp();save()});bindLevelActions(level);
  }

  function completeScreen(){
    state.currentScreen='complete';if(!state.completedLevels.includes('boss'))state.completedLevels.push('boss');recalcXp();save();burst();
    const gear=(state.answers.ai_tools||[]).length;
    app.innerHTML=`<section class="screen">${imageArt('assets/complete-hero.jpg','completion-art',true,'AI Explorer 探索完成慶典')}<div class="completion-card"><h1>探索完成！</h1><span class="ribbon-text">你已成為 AI Explorer 👑</span><p class="q-title">${esc(state.name)}，你完成了所有探索任務！</p><div class="completion-levels">${levels.map(l=>`<div class="completion-level"><span>${l.icon}</span>Lv.${l.level}<br>✓ 完成</div>`).join('')}</div><div class="summary-grid"><div class="summary-stat">🏁<b>5 / 5</b>關卡完成</div><div class="summary-stat">🎒<b>${gear}</b>AI 裝備</div><div class="summary-stat">⭐<b>${state.xp}</b>XP</div></div><div class="completion-actions"><button id="mapBtn" class="ghost-btn">🗺️ 世界地圖</button><button id="submitBtn" class="primary-btn">🏆 送出並完成遊戲</button></div><p class="tiny-note">接下來，真正的 AI 課程正式開始！</p></div></section>`;
    $('#mapBtn').addEventListener('click',mapScreen);$('#submitBtn').addEventListener('click',submitGame);
  }
  function burst(){const box=$('#confetti');box.innerHTML='';for(let i=0;i<50;i++){const s=document.createElement('span');s.style.left=Math.random()*100+'vw';s.style.animationDelay=Math.random()*.8+'s';s.style.background=['#ffd45a','#2797ef','#78ddb0','#ff9eb4','#9d81ef'][i%5];box.appendChild(s)}setTimeout(()=>box.innerHTML='',3000)}

  async function api(payload){if(!cfg.apiUrl||cfg.apiUrl.includes('PASTE_YOUR_'))throw new Error('DEMO_MODE');const res=await fetch(cfg.apiUrl,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});const text=await res.text();let data;try{data=JSON.parse(text)}catch{throw new Error('API 回傳格式錯誤')}if(!data.ok)throw new Error(data.error||'送出失敗');return data}
  function payload(){return {action:'submit',formVersion:cfg.formVersion,termId:academic.termId,termLabel:academic.termLabel,courseId:academic.courseId,courseLabel:academic.courseLabel,classId:academic.classId,classLabel:academic.classLabel,name:state.name,startedAt:state.startedAt||new Date().toISOString(),submittedAt:new Date().toISOString(),answers:state.answers,xp:state.xp,completedLevels:state.completedLevels,userAgent:navigator.userAgent}}
  function saveDemo(p){const list=JSON.parse(localStorage.getItem(cfg.demoStorageKey)||'[]');const key=[p.termId,p.courseId,p.classId,p.name.trim().toLowerCase()].join('|');const i=list.findIndex(x=>[x.termId,x.courseId,x.classId,String(x.name||'').trim().toLowerCase()].join('|')===key);i>=0?list[i]=p:list.push(p);localStorage.setItem(cfg.demoStorageKey,JSON.stringify(list))}
  async function submitGame(){const btn=$('#submitBtn');btn.disabled=true;btn.textContent='送出中…';const p=payload();try{await api(p);state.submitted=true;save();showToast('已送出！老師後台現在看得到你的結果。');btn.textContent='✅ 已完成'}catch(e){if(e.message==='DEMO_MODE'){saveDemo(p);state.submitted=true;save();showToast('預覽模式：資料已儲存在這台裝置');btn.textContent='✅ 已完成（預覽）'}else{showToast('送出失敗，答案已保留：'+e.message);btn.disabled=false;btn.textContent='🏆 重新送出'}}}

  const hadDraft=restore();recalcXp();
  if(hadDraft&&state.name){if(state.currentScreen==='complete')completeScreen();else if(state.currentScreen==='map')mapScreen();else if(state.currentScreen==='level')levelScreen(state.currentLevel||0);else welcome()}else welcome();
})();
