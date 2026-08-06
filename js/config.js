/* ============ Config ============ */

const DAY_NAMES = ['Bazar','B.e','Ç.a','Ç','C.a','C','Şənbə'];
const DAY_SHORT = ['B','B.e','Ç.a','Ç','C.a','C','Ş'];

// Program indexed 1-7 (1=Mon .. 7=Sun)
const WEEKDAY_MAP = {1:1,2:2,3:3,4:4,5:5,6:6,0:7}; // JS day -> program day
const PROGRAM_DAY_TO_JS = {1:1,2:2,3:3,4:4,5:5,6:6,7:0}; // program day -> JS day

const PROGRAM = {
  1:{title:'Sinə və Triceps günü',carb:'Düyü'},
  2:{rest:true},
  3:{title:'Kürək və Biceps günü',carb:'Bulqur'},
  4:{rest:true},
  5:{title:'Ayaq və Çiyin günü',carb:'Qreçka'},
  6:{rest:true},
  7:{title:'Kalça fokuslu günü',carb:'Makaron'}
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