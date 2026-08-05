/* ============ Init ============ */

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