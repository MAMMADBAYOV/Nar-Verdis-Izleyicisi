/* ============ Badges / Level ============ */

function levelFor(sessions){

  if(sessions>=25) return 'Peşəkar';

  if(sessions>=17) return 'Sabit';

  if(sessions>=8) return 'Davamlı';

  return 'Başlanğıc';

}

function renderBadgesLevel(){

  const sessions=window._sessionCount||0;

  const streak=window._currentStreak||0;

  const row=document.getElementById('badgesRow');

  row.innerHTML='';

  BADGES.forEach(b=>{

    const unlocked=b.need({sessions,streak});

    const el=document.createElement('div');

    el.className='badge'+(unlocked?'':' locked');

    el.textContent=b.label;

    row.appendChild(el);

  });

  document.getElementById('levelTag').innerHTML=
    `<span class="level-tag">
      Səviyyə: ${levelFor(sessions)}
    </span>`;

}

async function renderWeeklySummary(){

  let habitDays=0;

  let workoutCount=0;

  for(let i=0;i<7;i++){

    const d=dateNDaysAgo(i);

    const key=todayKey(d);

    let log=null;

    try{

      const r=await window.storage.get(logKey(key),false);

      if(r&&r.value) log=JSON.parse(r.value);

    }catch(e){}

    if(log && completedCount(Object.assign(emptyLog(),log))===HABITS.length){

      habitDays++;

    }

    try{

      const r2=await window.storage.get('workout-log:'+key,false);

      if(r2&&r2.value) workoutCount++;

    }catch(e){}

  }

  document.getElementById('weeklySummary').innerHTML=`

  <div style="font-size:13px;line-height:1.8;">

      ✅ Tam tamamlanmış gün:
      <b style="color:var(--gold);">
      ${habitDays}/7
      </b>

      <br>

      💪 Məşq sayı:
      <b style="color:var(--gold);">
      ${workoutCount}
      </b>

  </div>

  `;

}
