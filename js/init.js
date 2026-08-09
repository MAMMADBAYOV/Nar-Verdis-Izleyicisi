/* ============ Init ============ */

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='workout'){renderWorkoutProgress();renderDayPicker();renderWorkoutBody();}
    if(btn.dataset.tab==='food'){renderFoodDayPicker();renderFoodBody();}
  };
});

(async function init() {
  await loadProfile();
  await loadDay5Variant();

  renderDayPicker();
  await renderWorkoutBody();
  await renderWorkoutProgress();

  renderFoodDayPicker();
  renderFoodBody();

  await renderMeasureLog();
  await loadToday();
})();
