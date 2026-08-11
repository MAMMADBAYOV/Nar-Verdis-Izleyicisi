/* ============ Workout ============ */

let selectedProgDay=WEEKDAY_MAP[new Date().getDay()];
let day5Variant='standard';

async function loadDay5Variant(){
  try{const r=await window.storage.get('day5variant',false);if(r&&r.value)day5Variant=r.value;}catch(e){}
}
async function saveDay5Variant(v){day5Variant=v;try{await window.storage.set('day5variant',v,false);}catch(e){}}

function exFigure(e){
  if(e.img && IMG_MAP[e.img]) return `<img src="${IMG_MAP[e.img]}" alt="${e.name}" style="width:100%;height:100%;object-fit:cover;">`;
  return stickFigureSVG(e.pose,e.eng);
}
function stickFigureSVG(pose,eng){
  const rotStyle=pose==='floor'?'transform:rotate(90deg);transform-origin:50px 50px;':'';
  return `<svg class="ex-fig stick" viewBox="0 0 100 100"><g style="${rotStyle}"><g class="figure eng-${eng}">
    <circle class="head" cx="50" cy="18" r="8"/><line x1="50" y1="26" x2="50" y2="60"/>
    <line x1="50" y1="34" x2="32" y2="50"/><line x1="50" y1="34" x2="68" y2="50"/>
    <line x1="50" y1="60" x2="38" y2="88"/><line x1="50" y1="60" x2="62" y2="88"/>
  </g></g></svg>`;
}
function renderDayPicker(){
  const picker=document.getElementById('dayPicker');picker.innerHTML='';
  for(let pd=1;pd<=7;pd++){
    const jsDay=PROGRAM_DAY_TO_JS[pd];
    const prog=PROGRAM[pd];
    const pill=document.createElement('div');
    pill.className='day-pill'+(prog.rest?' rest':' workout')+(pd===selectedProgDay?' selected':'');
    const tag=prog.rest?'İstirahət':(prog.title.split(' ')[0]);
    pill.innerHTML=`<div class="dp-name">${DAY_SHORT[jsDay]}</div><div class="dp-tag">${tag}</div>`;
    pill.onclick=async()=>{
  selectedProgDay=pd;
  renderDayPicker();
  await renderWorkoutBody();
};
    picker.appendChild(pill);
  }
}
async function getExerciseWeight(pd,exId){
  try{const r=await window.storage.get('exw:'+pd+':'+exId,false);return r&&r.value?r.value:'';}catch(e){return '';}
}
async function setExerciseWeight(pd,exId,val){try{await window.storage.set('exw:'+pd+':'+exId,val,false);}catch(e){}}

async function renderWorkoutBody(){
  const body=document.getElementById('workoutBody');
  const prog=PROGRAM[selectedProgDay];
  const isToday = state.date === todayKey();
  const selectedDate = new Date(state.date + 'T00:00:00');
const todayDate = new Date(todayKey() + 'T00:00:00');
const isFuture = selectedDate > todayDate;
console.log('DATE TEST:', {
  stateDate: state.date,
  today: todayKey(),
  isToday: isToday,
  selectedDate: selectedDate.toString(),
  todayDate: todayDate.toString(),
  isFuture: isFuture
});
console.log('DEBUG DATE:', state.date, todayKey(), isToday, isFuture);

  if(prog.rest){
    body.innerHTML=`<div class="rest-card">İstirahət günü 🌿<br><span style="font-size:12.5px;">Yüngül gəzinti və ya dartınma ilə aktiv bərpa tövsiyə olunur.</span></div>`;
    return;
  }

  let html='';
  if((window._sessionCount||0)===0){
    html+=`<div class="note-card">👋 ${isToday?'Bu gün sənin proqramındır':'Yuxarıdan bugünkü günü seç'} — hərəkətlərə bax və "tamamladım" düyməsini bas.</div>`;
  }
  html+=`<div class="info-toggles">
    <details class="info-toggle"><summary>🔥 İsinmə</summary><div class="info-body">Hər məşqdən əvvəl 5-10 dəq yüngül kardio + dinamik dartınma.</div></details>
    <details class="info-toggle"><summary>🧊 Soyuma</summary><div class="info-body">Məşq sonunda 5 dəq statik dartınma.</div></details>
  </div>`;
  html+=`<div class="workout-head">${prog.title}</div><div class="workout-sub">${DAY_NAMES[PROGRAM_DAY_TO_JS[selectedProgDay]]}</div>`;

  if(selectedProgDay===5){
    html+=`<div class="variant-toggle">
      <div class="variant-btn ${day5Variant==='standard'?'active':''}" data-variant="standard">Standart</div>
      <div class="variant-btn ${day5Variant==='kalca'?'active':''}" data-variant="kalca">Kalça-fokuslu</div>
    </div>`;
  }

  const groups = prog.groups || (selectedProgDay===5 ? prog.variants[day5Variant].groups : null);
  const exIdCounter={n:0};
  const exWeights=[];

  if(groups){
    for(const g of groups){
      html+=`<div class="group-label">${g.name}</div>`;
      for(const e of g.exercises){
        const exId='d'+selectedProgDay+'-'+exIdCounter.n++;
        const w=await getExerciseWeight(selectedProgDay,exId);
        exWeights.push(exId);
        html+=`<div class="ex-card">
          <div class="ex-fig-box">${exFigure(e)}</div>
          <div class="ex-info">
            <div class="ex-name">${e.name}</div>
            <div class="ex-cue">${e.cue}</div>
            <div class="ex-reps">${e.reps}</div>
            <div class="ex-weight"><input type="number" data-exid="${exId}" value="${w}" placeholder="çəki"><span>kq</span></div>
          </div>
        </div>`;
      }
    }
  } else if(prog.circuit){
    html+=`<div class="note-card">3 dövrə (round) — hər dövrədə 4 hərəkət ardıcıl edilir, sonra təkrarlanır.</div>`;
    prog.circuit.forEach((e,i)=>{
      html+=`<div class="ex-card">
        <div class="ex-fig-box">${exFigure(e)}</div>
        <div class="ex-info">
          <div class="ex-name">${e.name}</div>
          <div class="ex-cue">${e.cue}</div>
          <div class="ex-reps">${e.reps} × 3 dövrə</div>
        </div>
      </div>`;
    });
  }

  if(prog.cardio) html+=`<div class="note-card">🏃 ${prog.cardio}</div>`;

  const workoutKey='workout-log:'+state.date;
let doneToday=false;

try{
  const r=await window.storage.get(workoutKey,false);
  doneToday = r?.value === 'true';
}catch(e){
  doneToday=false;
}

console.log('DONE STATUS:', {
  date: state.date,
  key: workoutKey,
  doneToday: doneToday
});   

html+=`<button class="complete-btn ${doneToday?'done':''}" id="completeBtn" ${(doneToday || isFuture)?'disabled':''} onclick="toggleWorkoutComplete()">
    ${doneToday?'✓ Məşq tamamlandı':(isFuture?'Gələcək gün':'Məşqi tamamladım')}
</button>`;

  body.innerHTML=html;

  document.querySelectorAll('.variant-btn').forEach(btn=>{
    btn.onclick=async()=>{await saveDay5Variant(btn.dataset.variant);renderWorkoutBody();};
  });
  document.querySelectorAll('.ex-weight input').forEach(inp=>{
    inp.onchange=()=>{setExerciseWeight(selectedProgDay,inp.dataset.exid,inp.value);};
  });
  
}
async function renderWorkoutProgress(){
  let count=0;
  try{const r=await window.storage.list('workout-log:',false);if(r&&r.keys)count=r.keys.length;}catch(e){}
  const phase=Math.min(1,count/TARGET_SESSIONS);
  renderSeedsInto('seedGroupProg',count,TARGET_SESSIONS,phase);
  const cap=document.getElementById('progCaption');
  if(count>=TARGET_SESSIONS){cap.innerHTML='🌱 2 aylıq hədəfi tamamladın!';cap.classList.add('full');
    document.querySelectorAll('#seedGroupProg .seed.on').forEach(s=>s.classList.add('burst'));
  }else{cap.innerHTML=`2 aylıq proqres: <b>${count} / ${TARGET_SESSIONS}</b> məşq`;cap.classList.remove('full');}
  window._sessionCount=count;
}
async function toggleWorkoutComplete(){
  const key='workout-log:'+state.date;

  try{
    const r=await window.storage.get(key,false);

    // Artıq tamamlanıbsa, heç nə etmə
    if(r && r.value){
      return;
    }

    // İlk klikdə tamamla
    await window.storage.set(key,'true',false);

    renderWorkoutBody();
    await renderWorkoutProgress();
    renderBadgesLevel();

  }catch(e){
    console.log('Workout completion error:',e);
  }
}