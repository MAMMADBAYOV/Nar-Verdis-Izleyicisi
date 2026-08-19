/* ============ Stats modal ============ */
document.getElementById('statsBtn').onclick=async()=>{
  renderBadgesLevel();await renderWeeklySummary();await renderMeasureLog();
  document.getElementById('statsModal').classList.add('show');
};
document.getElementById('statsCloseBtn').onclick=()=>document.getElementById('statsModal').classList.remove('show');

/* ============ Share ============ */
document.getElementById('shareBtn').onclick=()=>{
  document.getElementById('shareStreak').textContent=window._currentStreak||0;
  document.getElementById('shareSessions').textContent=(window._sessionCount||0)+' / 32';
  document.getElementById('shareModal').classList.add('show');
};
document.getElementById('shareCloseBtn').onclick=()=>document.getElementById('shareModal').classList.remove('show');

/* ============ Q&A ============ */
document.getElementById('qaBtn').onclick=()=>{
  const msg=encodeURIComponent('Salam, Nar tətbiqi ilə bağlı sualım var: ');
  window.open('https://wa.me/994776009494?text='+msg,'_blank');
};

/* ============ Milestone weight comparison ============ */
async function getMilestoneWeight(key){
  try{const r=await window.storage.get('milestone-'+key,false);return r&&r.value?r.value:null;}catch(e){return null;}
}
async function setMilestoneWeight(key,val){try{await window.storage.set('milestone-'+key,val,false);}catch(e){}}

async function renderMeasureLog(){
  const box=document.getElementById('milestoneBox');
  if(!box)return;
  const sessions=window._sessionCount||0;
  const startWeight=profile&&profile.weight?profile.weight:null;
  const w1=await getMilestoneWeight('1m');
  const w2=await getMilestoneWeight('2m');

  function milestoneRowHtml(label,unlockAt,storedVal,keyName){
    const unlocked=sessions>=unlockAt;
    let right='';
    if(storedVal){
      right=`<span class="milestone-value">${storedVal} kq</span>`;
    } else if(unlocked){
      right=`<input type="number" class="milestone-input" id="input-${keyName}" placeholder="kq"><button class="milestone-save" data-key="${keyName}">Yadda saxla</button>`;
    } else {
      right=`<span class="milestone-locked">🔒 ${unlockAt} məşqdən sonra açılır</span>`;
    }
    return `<div class="milestone-row"><div class="milestone-label"><b>${label}</b></div>${right}</div>`;
  }

  let html='';
  html+=`<div class="milestone-row"><div class="milestone-label"><b>Başlanğıc</b></div><span class="milestone-value">${startWeight?startWeight+' kq':'—'}</span></div>`;
  html+=milestoneRowHtml('1 ay',MILESTONE_1M_SESSIONS,w1,'1m');
  html+=milestoneRowHtml('2 ay',MILESTONE_2M_SESSIONS,w2,'2m');

  if(startWeight&&w1&&w2){
    const d1=(parseFloat(w1)-parseFloat(startWeight)).toFixed(1);
    const d2=(parseFloat(w2)-parseFloat(startWeight)).toFixed(1);
    html+=`<div class="milestone-summary">${startWeight}kq → ${w1}kq (${d1>0?'+':''}${d1}) → ${w2}kq (${d2>0?'+':''}${d2})</div>`;
  }

  box.innerHTML=html;
  document.querySelectorAll('.milestone-save').forEach(btn=>{
    btn.onclick=async()=>{
      const key=btn.dataset.key;
      const val=document.getElementById('input-'+key).value.trim();
      if(!val)return;
      await setMilestoneWeight(key,val);
      renderMeasureLog();
    };
  });
}
