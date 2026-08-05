/* ============ Food / Nutrition ============ */

const CARB_INFO={
  'Düyü':{loss:150,maintain:200,gain:300},
  'Bulqur':{loss:150,maintain:200,gain:300},
  'Qreçka':{loss:150,maintain:200,gain:300},
  'Makaron':{loss:150,maintain:200,gain:300}
};

const PROTEIN_G={
  loss:150,
  maintain:180,
  gain:220
};

const GOAL_LABEL={
  loss:'Çəki salma',
  maintain:'Çəki saxlama',
  gain:'Çəki artırma'
};

function foodDayInfo(pd){
  const prog=PROGRAM[pd];

  if(prog.rest){
    let prev=pd-1;
    while(prev>=1 && PROGRAM[prev].rest) prev--;
    if(prev<1) prev=1;
    return {
      carb:PROGRAM[prev].carb,
      isRest:true
    };
  }

  return {
    carb:prog.carb,
    isRest:false
  };
}

document.querySelectorAll('.goal-pill').forEach(p=>{
  p.onclick=async()=>{
    document.querySelectorAll('.goal-pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');

    if(profile){
      profile.goal=p.dataset.goal;
      try{
        await window.storage.set('profile',JSON.stringify(profile),false);
      }catch(e){}
    }

    renderFoodBody();
  };
});

let selectedFoodDay=WEEKDAY_MAP[new Date().getDay()];

function renderFoodDayPicker(){

  const picker=document.getElementById('foodDayPicker');
  picker.innerHTML='';

  for(let pd=1;pd<=7;pd++){

    const jsDay=PROGRAM_DAY_TO_JS[pd];
    const info=foodDayInfo(pd);

    const pill=document.createElement('div');

    pill.className='day-pill'+
      (pd===selectedFoodDay?' selected':'');

    pill.innerHTML=`
      <div class="dp-name">${DAY_SHORT[jsDay]}</div>
      <div class="dp-tag">${info.carb}</div>
    `;

    pill.onclick=()=>{
      selectedFoodDay=pd;
      renderFoodDayPicker();
      renderFoodBody();
    };

    picker.appendChild(pill);
  }

}

function renderFoodBody(){

  const body=document.getElementById('foodBody');

  const goal=(profile&&profile.goal)||'maintain';

  const info=foodDayInfo(selectedFoodDay);

  const carbG=CARB_INFO[info.carb][goal];

  const protG=PROTEIN_G[goal];

  let freeMealNote='';

  if(selectedFoodDay===4){

    freeMealNote=`
      <div class="note-card">
      🍽️ Tövsiyə:
      bu gün "sərbəst yemək günü"
      kimi istifadə edə bilərsən.
      İstədiyin istənilən günü
      seçə bilərsən —
      məcburi deyil.
      </div>
    `;

  }

  let html=`
  <div class="note-card">

  Hədəf:

  <b style="color:var(--gold);">
  ${GOAL_LABEL[goal]}
  </b>

  ·

  Bugünkü karbohidrat:

  <b style="color:var(--gold);">
  ${info.carb}
  </b>

  </div>
  `;

  html+=freeMealNote;

  html+=`

<div class="meal-card">

<div class="meal-row">

<div class="meal-row-title">

🌅 Səhər yeməyi

</div>

<div class="meal-row-item">

<b>A)</b>

${goal==='gain'
?'4'
:goal==='loss'
?'2 bütöv + 2 ağ'
:'3'}

ədəd yumurta

+

1 dilim tam buğda çörək

+

tərəvəz

(pomidor/xiyar)

</div>

<div class="meal-row-alt">

<b>B)</b>

60 qr yulaf

(süd və ya su ilə)

+

1 meyvə

(banan/alma)

+

1 ovuc qoz

${goal==='gain'
?' + 1 qaşıq bal'
:''}

</div>

</div>

<div class="meal-row">

<div class="meal-row-title">

☀️ Qəlyanaltı

</div>

<div class="meal-row-item">

${goal==='loss'
?'1 ovuc badam/qoz (20 qr) və ya 1 meyvə və ya 150 qr süzmə pendir'
:goal==='maintain'
?'1 ovuc badam (30 qr) + 1 banan'
:'Qarışıq quru meyvə/qoz-fındıq (40 qr) + 1 stəkan süd/kefir'}

</div>

</div>

<div class="meal-row">

<div class="meal-row-title">

🍽️ Günorta yeməyi

</div>

<div class="meal-row-item">

<b>${carbG} qr</b>

bişmiş

${info.carb.toLowerCase()}

+

<b>${protG} qr</b>

zülal

(toyuq/mal əti/balıq/yumurta seçimindən biri)

+

tərəvəz salatı

</div>

</div>

<div class="meal-row">

<div class="meal-row-title">

🌙 Axşam yeməyi

</div>

<div class="meal-row-item">

<b>${Math.round(carbG*0.7)} qr</b>

bişmiş

${info.carb.toLowerCase()}

+

<b>${protG} qr</b>

zülal

(toyuq/mal əti/balıq/yumurta seçimindən biri)

+

tərəvəz salatı

</div>

</div>

</div>

`;

  html+=`

<details class="info-toggle" style="margin-bottom:14px;">

<summary>

⏱️ Yemək vaxtı tövsiyəsi

</summary>

<div class="info-body">

Sabit saat yoxdur —

öz rejiminə uyğunlaş.

Səhər yeməyindən

2-3 saat sonra

qəlyanaltı,

2 saat sonra

günorta,

3-4 saat sonra

qəlyanaltı,

2-3 saat sonra

axşam yeməyi

tövsiyə olunur.

</div>

</details>

`;

  body.innerHTML=html;

}