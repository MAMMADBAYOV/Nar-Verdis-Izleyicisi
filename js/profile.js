/* ============ Profile ============ */
function openProfileModal(prefill){
  document.getElementById('profileMsg').textContent='';
  if(prefill){document.getElementById('inHeight').value=prefill.height||'';document.getElementById('inWeight').value=prefill.weight||'';selectedGender=prefill.gender||null;selectedGoal=prefill.goal||null;}
  else{document.getElementById('inHeight').value='';document.getElementById('inWeight').value='';selectedGender=null;selectedGoal=null;}
  document.querySelectorAll('#genderRow .pill').forEach(p=>p.classList.toggle('on',p.dataset.val===selectedGender));
  document.querySelectorAll('#goalRow .pill').forEach(p=>p.classList.toggle('on',p.dataset.val===selectedGoal));
  document.getElementById('profileModal').classList.add('show');
}
document.querySelectorAll('#genderRow .pill').forEach(p=>{p.onclick=()=>{selectedGender=p.dataset.val;document.querySelectorAll('#genderRow .pill').forEach(x=>x.classList.toggle('on',x===p));};});
document.querySelectorAll('#goalRow .pill').forEach(p=>{p.onclick=()=>{selectedGoal=p.dataset.val;document.querySelectorAll('#goalRow .pill').forEach(x=>x.classList.toggle('on',x===p));};});
document.getElementById('profileBtn').onclick=()=>openProfileModal(profile);
document.getElementById('saveProfileBtn').onclick=async()=>{
  const h=document.getElementById('inHeight').value.trim(),w=document.getElementById('inWeight').value.trim();
  if(!h||!w||!selectedGender||!selectedGoal){document.getElementById('profileMsg').textContent='Zəhmət olmasa hamısını doldur.';return;}
  const isFirstTime=!profile;
  profile={height:h,weight:w,gender:selectedGender,goal:selectedGoal};
  try{await window.storage.set('profile',JSON.stringify(profile),false);}catch(e){}
  document.getElementById('profileModal').classList.remove('show');
  syncGoalPills();renderFoodBody();
  if(isFirstTime) document.getElementById('onboardModal').classList.add('show');
};
document.getElementById('onboardCloseBtn').onclick=()=>document.getElementById('onboardModal').classList.remove('show');
async function loadProfile(){
  try{const r=await window.storage.get('profile',false);if(r&&r.value)profile=JSON.parse(r.value);}catch(e){profile=null;}
  if(!profile)openProfileModal(null);
  syncGoalPills();
}
function syncGoalPills(){
  if(!profile)return;
  document.querySelectorAll('#goalPills .goal-pill').forEach(p=>p.classList.toggle('active',p.dataset.goal===profile.goal));
}

