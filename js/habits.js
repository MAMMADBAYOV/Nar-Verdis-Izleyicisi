/* ============ Habits ============ */

const HABITS = [
  {id:'su',name:'Su iç',type:'counter',unit:'stəkan',target:8,step:1},
  {id:'yuxu',name:'Yuxu',type:'counter',unit:'saat',target:7,step:1},
  {id:'mesq',name:'Məşq et',type:'boolean'}
];

const SEED_ROWS = [3,5,6,5,3];
const TOTAL_SEEDS = SEED_ROWS.reduce((a,b)=>a+b,0);
const TARGET_SESSIONS = 32;

function todayKey(d=new Date()){
  return d.toISOString().slice(0,10);
}

function dateNDaysAgo(n){
  const d=new Date();
  d.setDate(d.getDate()-n);
  return d;
}

function logKey(k){
  return 'log:'+k;
}

function emptyLog(){
  const o={};
  HABITS.forEach(h=>o[h.id]=h.type==='boolean'?false:0);
  return o;
}

function isComplete(h,v){
  return h.type==='boolean'?!!v:v>=h.target;
}

function completedCount(log){
  return HABITS.filter(h=>isComplete(h,log[h.id])).length;
}

async function loadToday(){
  try{
    const r=await window.storage.get(logKey(state.date),false);
    if(r&&r.value)
      state.log=Object.assign(emptyLog(),JSON.parse(r.value));
  }catch(e){}
  render();
  renderWeek();
  renderBadgesLevel();
  renderWeeklySummary();
}

async function saveToday(){
  try{
    await window.storage.set(logKey(state.date),JSON.stringify(state.log),false);
  }catch(e){}
  render();
  renderWeek();
  renderWorkoutBody();
  renderBadgesLevel();
  renderWeeklySummary();
}

function renderSeedsInto(groupId,filledCount,total,colorPhase){
  const group=document.getElementById(groupId);
  if(!group)return;

  group.innerHTML='';

  const filled=Math.round((filledCount/total)*TOTAL_SEEDS);

  let idx=0;
  const rowY=[80,100,120,140,158],
        cx=100,
        spacing=18;

  SEED_ROWS.forEach((num,rowIdx)=>{
    const startX=cx-((num-1)*spacing)/2;

    for(let i=0;i<num;i++){

      const on=idx<filled;
      idx++;

      const el=document.createElementNS('http://www.w3.org/2000/svg','circle');

      el.setAttribute('cx',startX+i*spacing);
      el.setAttribute('cy',rowY[rowIdx]);
      el.setAttribute('r',6.4);

      let color='#3D4C3F';

      if(on){
        if(colorPhase!==undefined){
          const t=Math.min(1,colorPhase);

          const rC=Math.round(74+(194-74)*t);
          const gC=Math.round(122+(50-122)*t);
          const bC=Math.round(74+(74-74)*t);

          color=`rgb(${rC},${gC},${bC})`;
        }else{
          color='#C23A54';
        }
      }

      el.setAttribute('fill',color);
      el.setAttribute('class','seed '+(on?'on':'off'));

      group.appendChild(el);
    }
  });
}