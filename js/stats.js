/* ============ Stats ============ */

document.getElementById('statsBtn').onclick=async()=>{

  renderBadgesLevel();

  await renderWeeklySummary();

  await renderMeasureLog();

  document.getElementById('statsModal').classList.add('show');

};

document.getElementById('statsCloseBtn').onclick=()=>{

  document.getElementById('statsModal').classList.remove('show');

};