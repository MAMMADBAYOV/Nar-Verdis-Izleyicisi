/* ============ Utils ============ */

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function logKey(k) {
  return 'log:' + k;
}

function emptyLog() {
  const o = {};
  HABITS.forEach(h => {
    o[h.id] = h.type === 'boolean' ? false : 0;
  });
  return o;
}

function isComplete(h, v) {
  return h.type === 'boolean'
    ? !!v
    : v >= h.target;
}

function completedCount(log) {
  return HABITS.filter(h => isComplete(h, log[h.id])).length;
}