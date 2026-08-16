/* ============ Workout ============ */

let selectedProgDay=WEEKDAY_MAP[new Date().getDay()];
let day5Variant='standard';
let workoutWeekOffset=0;

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
  const picker=document.getElementById('dayPicker');
  picker.innerHTML='';

  const selected=new Date(state.date+'T00:00:00');

  const box=document.createElement('div');
  box.className='workout-date-box';

  const title=document.createElement('div');
  title.className='workout-date-title';
  title.textContent='Məşq günü';

  const dateBtn=document.createElement('button');
  dateBtn.className='workout-date-button';
  dateBtn.type='button';

  const dayNames=[
    'Bazar',
    'Bazar ertəsi',
    'Çərşənbə axşamı',
    'Çərşənbə',
    'Cümə axşamı',
    'Cümə',
    'Şənbə'
  ];

  const monthNames=[
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'İyun',
    'İyul',
    'Avqust',
    'Sentyabr',
    'Oktyabr',
    'Noyabr',
    'Dekabr'
  ];

  const dayName=dayNames[selected.getDay()];
  const day=String(selected.getDate()).padStart(2,'0');
  const month=String(selected.getMonth()+1).padStart(2,'0');
  const year=selected.getFullYear();

  dateBtn.innerHTML=`
    <span class="date-calendar-icon">📅</span>
    <span class="workout-date-value">${day}.${month}.${year}</span>
    <span class="date-chevron">⌄</span>
  `;

  dateBtn.onclick=()=>{
    document.querySelectorAll('.workout-date-modal').forEach(el=>el.remove());

    const overlay=document.createElement('div');
    overlay.className='workout-date-modal';

    const modal=document.createElement('div');
    modal.className='workout-date-modal-box';

    const header=document.createElement('div');
    header.className='workout-date-modal-header';

    const heading=document.createElement('div');
    heading.className='workout-date-modal-heading';
    heading.textContent='Məşq günü';

    const close=document.createElement('button');
    close.className='workout-date-modal-close';
    close.type='button';
    close.textContent='×';

    header.appendChild(heading);
    header.appendChild(close);

    const calendarHeader=document.createElement('div');
    calendarHeader.className='workout-calendar-header';

    const prevBtn=document.createElement('button');
    prevBtn.type='button';
    prevBtn.className='workout-calendar-nav';
    prevBtn.textContent='‹';

    const monthTitle=document.createElement('div');
    monthTitle.className='workout-calendar-month';

    const nextBtn=document.createElement('button');
    nextBtn.type='button';
    nextBtn.className='workout-calendar-nav';
    nextBtn.textContent='›';

    calendarHeader.appendChild(prevBtn);
    calendarHeader.appendChild(monthTitle);
    calendarHeader.appendChild(nextBtn);

    const weekdays=document.createElement('div');
    weekdays.className='workout-calendar-weekdays';

    const weekdayNames=[
      'B.e',
      'Ç.a',
      'Ç',
      'C.a',
      'C',
      'Ş',
      'B'
    ];

    weekdayNames.forEach(name=>{
      const el=document.createElement('div');
      el.textContent=name;
      weekdays.appendChild(el);
    });

    const calendarGrid=document.createElement('div');
    calendarGrid.className='workout-calendar-grid';

    const cancel=document.createElement('button');
    cancel.type='button';
    cancel.className='workout-date-modal-cancel';
    cancel.textContent='Ləğv et';

    modal.appendChild(header);
    modal.appendChild(calendarHeader);
    modal.appendChild(weekdays);
    modal.appendChild(calendarGrid);
    modal.appendChild(cancel);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let viewYear=selected.getFullYear();
    let viewMonth=selected.getMonth();

    const closeModal=()=>{
      overlay.remove();
    };

    close.onclick=closeModal;
    cancel.onclick=closeModal;

    overlay.onclick=(e)=>{
      if(e.target===overlay){
        closeModal();
      }
    };

async function drawCalendar(){
  monthTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;
  calendarGrid.innerHTML = '';

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  /*
   * JavaScript həftəni bazardan başladır.
   * Bizim görünüş isə bazar ertəsindən başlayır.
   */
  const startOffset = (firstDay + 6) % 7;

  // Boş xanalar
  for(let i = 0; i < startOffset; i++){
    const empty = document.createElement('div');
    empty.className = 'workout-calendar-empty';
    calendarGrid.appendChild(empty);
  }

  // Günlər
  for(let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++){

    const dayBtn = document.createElement('button');

    dayBtn.type = 'button';
    dayBtn.className = 'workout-calendar-day';
    dayBtn.textContent = dayNumber;

    const currentKey =
      `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNumber).padStart(2,'0')}`;

    // Seçilmiş tarix
    if(currentKey === state.date){
      dayBtn.classList.add('selected');
    }

    // Bugünkü tarix
    const today = todayKey();

    if(currentKey === today){
      dayBtn.classList.add('today');
    }

    /*
     * Məşqin tamamlanıb-tamamlanmadığını yoxlayırıq.
     */
    try {
      const workoutLog = await window.storage.get(
        'workout-log:' + currentKey,
        false
      );

      if(workoutLog && workoutLog.value === 'true'){
        dayBtn.classList.add('completed');
      }
    } catch(error) {
      console.log(
        'Calendar workout check error:',
        currentKey,
        error
      );
    }

    // Tarix seçimi
    dayBtn.onclick = async()=>{

      state.date = currentKey;

      const d = new Date(
        state.date + 'T00:00:00'
      );

      selectedProgDay = WEEKDAY_MAP[d.getDay()];

      closeModal();

      renderDayPicker();

      await renderWorkoutBody();
    };

    calendarGrid.appendChild(dayBtn);
  }
}

    prevBtn.onclick=()=>{
      viewMonth--;

      if(viewMonth<0){
        viewMonth=11;
        viewYear--;
      }

      drawCalendar();
    };

    nextBtn.onclick=()=>{
      viewMonth++;

      if(viewMonth>11){
        viewMonth=0;
        viewYear++;
      }

      drawCalendar();
    };

    drawCalendar();
  };

  box.appendChild(title);
  box.appendChild(dateBtn);

  picker.appendChild(box);
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
  let exists=false;

  try{
    const r=await window.storage.get(key,false);
    exists=!!(r&&r.value);
  }catch(e){
    // Key yoxdursa, bu gün məşq tamamlanmayıb deməkdir
    exists=false;
  }

  if(exists){
    return;
  }

  try{
    await window.storage.set(key,'true',false);

    await renderWorkoutBody();
    await renderWorkoutProgress();
    renderBadgesLevel();

  }catch(e){
    console.log('Workout completion error:',e);
  }
}