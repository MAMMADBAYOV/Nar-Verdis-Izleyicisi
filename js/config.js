/* ============ Config ============ */

const DAY_NAMES = ['Bazar','B.e','Ç.a','Ç','C.a','C','Şənbə'];
const DAY_SHORT = ['B','B.e','Ç.a','Ç','C.a','C','Ş'];

// Program indexed 1-7 (1=Mon .. 7=Sun)
const WEEKDAY_MAP = {1:1,2:2,3:3,4:4,5:5,6:6,0:7}; // JS day -> program day
const PROGRAM_DAY_TO_JS = {1:1,2:2,3:3,4:4,5:5,6:6,7:0}; // program day -> JS day

/* ============ Workout Program (fixed, dictated by user) ============ */
function ex(name,pose,eng,reps,cue,img){return{name,pose,eng,reps,cue,img};}

// Day 6 and Day 7 both use the same press (core) circuit — defined once here
// so a future change to these exercises only needs to happen in one place.
function pressCircuit(){
  return [
    ex('Crunch (Yarım Mekik)','floor','bob','20-25 ədəd','Yuxarı bədəni qaldırıb qarına sıxma.','crunch'),
    ex('Lying Leg Raise','floor','bob','20 ədəd','Uzanaraq ayaqları düz qaldır.','lying_leg_raise'),
    ex('Bicycle Crunch','floor','step','20 ədəd','Növbəli dirsək-diz toxunması.','bicycle_crunch'),
    ex('Plank','floor','hold','40-45 saniyə','Dirsək və ayaq barmaqları üstə bədəni düz xətt saxla, qarnı sıx.','plank')
  ];
}


const PROGRAM={
  1:{title:'Sinə və Triceps günü',carb:'Düyü',
     groups:[
       {name:'Sinə',exercises:[
         ex('Dumbbell Press','floor','bob','3×10-12','Üst sinə əzələlərini hədəf alaraq daha dolğun görünüş yaradır.','dumbbell_press'),
         ex('Butterfly','floor','bob','3×10-12','Sinənin daxili/orta xəttini hədəf alır, dolğun görünüş verir.','butterfly'),
         ex('Cable Crossover','stand','bob','3×10-12','Kabelləri yuxarıdan tutub sinəni qabağa verərək qolları aşağıda birləşdir.','cable_crossover'),
         ex('Low-to-High Cable Fly','stand','bob','3×10-12','Yüngül/orta çəki istifadə et — ağır çəkidə yük ön çiyinlərə keçir.','low_high_cable_fly')
       ]},
       {name:'Triceps',exercises:[
         ex('Triceps Pushdown (düz bar)','stand','bob','3×12-15','Dirsəklər bədənə yapışıq, aşağı düzbucaqlı itələ. Dirsəklər tərpənməsin.','triceps_pushdown_bar'),
         ex('Triceps Pushdown (kanat)','stand','bob','3×12-15','Eyni texnika, kanatla — dirsəklər bədənə yapışıq.','triceps_pushdown_rope'),
         ex('Cable Overhead Triceps Extension','stand','bob','3×10-12','Tricepsin uzun başını uzadır, arxadan həcm qazandırır.','overhead_triceps_ext')
       ]}
     ],
     cardio:'25-30 dəqiqə kardiyo (incline 19, sürət 4-6 — özünə uyğun)'
  },
  2:{rest:true},
  3:{title:'Kürək və Biceps günü',carb:'Bulqur',
     groups:[
       {name:'Kürək',exercises:[
         ex('Lat Pulldown','stand','bob','3×10-12','Qolları geniş tutub sinəyə çək — "qanad" əzələlərini böyüdür, V-forma verir.','lat_pulldown'),
         ex('Seated Cable Row','stand','bob','3×10-12','Tutacağı qarına doğru çək — kürəyin orta hissəsini qalınlaşdırır.','seated_cable_row'),
         ex('One-Arm Dumbbell Row','floor','bob','3×10-12','Bir diz skamyada, tək qanteli belə çək — hər tərəfi fərdi işlədir.','one_arm_dumbbell_row'),
         ex('Straight-Arm Pulldown (kəndir)','stand','bob','3×10-12','Kürək sonunda, lat əzələni tam təcrid edir.','straight_arm_pulldown')
       ]},
       {name:'Trapesiya',exercises:[
         ex('Shrug (Barbell/Dumbbell)','stand','bob','3×12-15','Çiyinləri düz yuxarı-aşağı qaldır (qulaqlara doğru) — kürəyin yuxarısını doldurur.','shrug')
       ]},
       {name:'Biceps',exercises:[
         ex('Barbell Curl (Z bar tövsiyə)','stand','bob','3×10-12','Hər iki biceps başını hədəfləyən əsas baza hərəkət.','barbell_curl'),
         ex('Dumbbell Hammer Curl','stand','bob','3×10-12','Çəkic tutuşu — brachialis/ön qolu işlədir, qolu enli göstərir.','hammer_curl'),
         ex('Incline Dumbbell Curl','floor','bob','3×10-12','Meyilli skamyada — bicepsin uzun başını maksimum dartır.','incline_curl')
       ]}
     ],
     cardio:'25-30 dəqiqə kardiyo (incline 19, sürət 4-6 — özünə uyğun)'
  },
  4:{rest:true},
  5:{title:'Ayaq və Çiyin günü',carb:'Qreçka',
     variants:{
       standard:{label:'Standart',groups:[
         {name:'Çiyin',exercises:[
           ex('Seated Dumbbell Press','floor','bob','3×10-12','Oturub qantelləri başın üstünə itələ — çiyinə kütlə/güc verən compound hərəkət.','seated_shoulder_press'),
           ex('Cable Lateral Raise','stand','bob','3×10-12','Yan çiyini təcrid edir, çiyinləri enli göstərir.','cable_lateral_raise'),
           ex('Face Pull (kəndir)','stand','bob','3×10-12','Kəndiri alnına doğru çək, dirsəklər geriyə — arxa çiyin + postura düzəlir.','face_pull')
         ]},
         {name:'Ayaq',exercises:[
           ex('Barbell Squat','stand','bend','3×10-12','Ayaqların şahı — ön/arxa ayaq və sağrını birgə işlədir, maksimum kütlə.','barbell_squat'),
           ex('Leg Press','floor','bend','3×10-12','Platformanı ayaqla itələ — belə yük salmadan ayağa fokuslanır.','leg_press'),
           ex('Leg Extension','floor','bend','3×10-12','Ön ayaq (quadriceps) əzələsini tam təcrid edir.','leg_extension'),
           ex('Lying Leg Curl','floor','bend','3×10-12','Dabanla geriyə bük — arxa ayaq (hamstring) əzələsini hədəfləyir.','lying_leg_curl')
         ]}
       ]},
       kalca:{label:'Kalça-fokuslu',groups:[
         {name:'Çiyin',exercises:[
           ex('Seated Dumbbell Press','floor','bob','3×10-12','Oturub qantelləri başın üstünə itələ — çiyinə kütlə/güc verən compound hərəkət.','seated_shoulder_press'),
           ex('Cable Lateral Raise','stand','bob','3×10-12','Yan çiyini təcrid edir, çiyinləri enli göstərir.','cable_lateral_raise'),
           ex('Face Pull (kəndir)','stand','bob','3×10-12','Kəndiri alnına doğru çək, dirsəklər geriyə — arxa çiyin + postura düzəlir.','face_pull')
         ]},
         {name:'Kalça / Ayaq',exercises:[
           ex('Hip Thrust','floor','bend','3×12-15','Kalça əzələsini birbaşa aktivləşdirir — forma və həcm artırır.','hip_thrust'),
           ex('Romanian Deadlift','stand','bend','3×10-12','Arxa ayaq (hamstring) + kalça — budun arxa xəttini formalaşdırır.','romanian_deadlift'),
           ex('Bulgarian Split Squat','stand','step','3×10-12 (hər ayaq)','Hər ayağı ayrı işlədir — kalça + ön bud, asimmetriyanı düzəldir.','bulgarian_split_squat'),
           ex('Cable/Band Kickback','stand','step','3×12-15 (hər ayaq)','Kalçanı təcrid edir, alt-kalça bölgəsinə fokuslanır.','cable_kickback'),
           ex('Sumo Squat','stand','bend','3×12-15','Geniş addım — daxili omba + kalça, omba xəttini formalaşdırır.','sumo_squat')
         ]}
       ]}
     },
     cardio:null
  },
  6:{title:'Press günü',carb:'Makaron',
     circuit:pressCircuit(),
     rounds:3,
     cardio:null
  },
  7:{title:'Press günü',carb:'Qreçka',
     circuit:pressCircuit(),
     rounds:3,
     cardio:'Zala gedilirsə əlavə kardiyo edilsin'
  }
};

const CARB_INFO = {
  'Düyü':{loss:150,maintain:200,gain:300},
  'Bulqur':{loss:150,maintain:200,gain:300},
  'Qreçka':{loss:150,maintain:200,gain:300},
  'Makaron':{loss:150,maintain:200,gain:300}
};

const PROTEIN_G = {loss:150,maintain:180,gain:220};
const GOAL_LABEL = {
  loss:'Çəki salma',
  maintain:'Çəki saxlama',
  gain:'Çəki artırma'
};

/* ============ Habits ============ */
const HABITS = [
  {id:'su',name:'Su iç',type:'counter',unit:'stəkan',target:8,step:1},
  {id:'yuxu',name:'Yuxu',type:'counter',unit:'saat',target:7,step:1},
  {id:'mesq',name:'Məşq et',type:'boolean'}
];

const SEED_ROWS = [3,5,6,5,3];
const TOTAL_SEEDS = SEED_ROWS.reduce((a,b)=>a+b,0);
const TARGET_SESSIONS = 32;

/* ============ Badges / Level ============ */
const BADGES=[
  {id:'first',label:'🌱 İlk addım',need:s=>s.sessions>=1},
  {id:'week',label:'🔥 7 gün ardıcıl',need:s=>s.streak>=7},
  {id:'month',label:'🍎 1 ay tamamlandı',need:s=>s.sessions>=16},
  {id:'full',label:'🍇 2 ay tamamlandı',need:s=>s.sessions>=32}
];

/* ============ Milestone weight comparison ============ */
const MILESTONE_1M_SESSIONS=16;
const MILESTONE_2M_SESSIONS=32;
