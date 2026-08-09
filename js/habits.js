/* ============ Habits ============ */

function render() {
  const done = completedCount(state.log);
  renderSeedsInto('seedGroup', done, HABITS.length);
  const cap = document.getElementById('narCaption');
  if (done === HABITS.length) { cap.innerHTML = '🌱 Bu gün hamısı tamamlandı!'; cap.classList.add('full'); }
  else { cap.innerHTML = `Bu gün <b>${done} / ${HABITS.length}</b> vərdiş tamamlandı`; cap.classList.remove('full'); }
  const list = document.getElementById('habitList'); list.innerHTML = '';
  HABITS.forEach(h => {
    const val = state.log[h.id]; const complete = isComplete(h, val);
    const row = document.createElement('div'); row.className = 'habit' + (complete ? ' done' : '');
    const left = document.createElement('div'); left.className = 'h-left';
    const dot = document.createElement('div'); dot.className = 'h-dot';
    const tw = document.createElement('div');
    const nm = document.createElement('div'); nm.className = 'h-name'; nm.textContent = h.name; tw.appendChild(nm);
    if (h.type === 'counter') { const sub = document.createElement('div'); sub.className = 'h-sub'; sub.textContent = `${val} / ${h.target} ${h.unit}`; tw.appendChild(sub); }
    left.appendChild(dot); left.appendChild(tw);
    const right = document.createElement('div'); right.className = 'h-right';
    if (h.type === 'counter') {
      const st = document.createElement('div'); st.className = 'stepper';
      const mi = document.createElement('button'); mi.textContent = '−'; mi.onclick = () => { state.log[h.id] = Math.max(0, val - h.step); saveToday(); };
      const ct = document.createElement('div'); ct.className = 'count'; ct.textContent = val;
      const pl = document.createElement('button'); pl.textContent = '+'; pl.onclick = () => { state.log[h.id] = val + h.step; saveToday(); };
      st.appendChild(mi); st.appendChild(ct); st.appendChild(pl); right.appendChild(st);
    } else {
      const tg = document.createElement('div'); tg.className = 'toggle' + (val ? ' on' : '');
      const kn = document.createElement('div'); kn.className = 'knob'; tg.appendChild(kn);
      tg.onclick = () => { state.log[h.id] = !state.log[h.id]; saveToday(); }; right.appendChild(tg);
    }
    row.appendChild(left); row.appendChild(right); list.appendChild(row);
  });
}
async function renderWeek() {
  const grid = document.getElementById('weekGrid'); grid.innerHTML = '';
  const dn = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş'];
  for (let i = 6; i >= 0; i--) {
    const d = dateNDaysAgo(i), key = todayKey(d); let log = null;
    try { const r = await window.storage.get(logKey(key), false); if (r && r.value) log = JSON.parse(r.value); } catch (e) { }
    const de = document.createElement('div'); de.className = 'day';
    de.onclick = () => selectHabitDate(key);
    de.style.cursor = 'pointer';
    const box = document.createElement('div'); let cls = 'box';
    if (log) { const c = completedCount(Object.assign(emptyLog(), log)); if (c === HABITS.length) cls += ' full'; else if (c > 0) cls += ' partial'; }
    if (key === state.date) cls += ' today'; box.className = cls;
    const lb = document.createElement('div'); lb.className = 'dlabel'; lb.textContent = dn[d.getDay()];
    de.appendChild(box); de.appendChild(lb); grid.appendChild(de);
  }
  let streak = 0, cursor = new Date();
  const todayDone = completedCount(state.log) === HABITS.length;
  if (!todayDone) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const key = todayKey(cursor); let log = null;
    try { const r = await window.storage.get(logKey(key), false); if (r && r.value) log = JSON.parse(r.value); } catch (e) { break; }
    if (log && completedCount(Object.assign(emptyLog(), log)) === HABITS.length) { streak++; cursor.setDate(cursor.getDate() - 1); } else break;
  }
  document.getElementById('streakBadge').textContent = `🔥 ${streak} gün`;
  window._currentStreak = streak;
}
async function selectHabitDate(key) {
  state.date = key;

  try {
    const r = await window.storage.get(logKey(key), false);

    if (r && r.value) {
      state.log = Object.assign(emptyLog(), JSON.parse(r.value));
    } else {
      state.log = emptyLog();
    }
  } catch (e) {
    state.log = emptyLog();
  }

  render();
  await renderWeek();
  renderBadgesLevel();
  renderWeeklySummary();
}
async function loadToday() {
  try {
    const r = await window.storage.get(logKey(state.date), false);
    if (r && r.value)
      state.log = Object.assign(emptyLog(), JSON.parse(r.value));
  } catch (e) { }
  render();
  renderWeek();
  renderBadgesLevel();
  renderWeeklySummary();
}

async function saveToday() {
  try {
    await window.storage.set(logKey(state.date), JSON.stringify(state.log), false);
  } catch (e) { }
  render();
  renderWeek();
  renderWorkoutBody();
  renderBadgesLevel();
  renderWeeklySummary();
}

function renderSeedsInto(groupId, filledCount, total, colorPhase) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.innerHTML = '';

  const filled = Math.round((filledCount / total) * TOTAL_SEEDS);

  let idx = 0;
  const rowY = [80, 100, 120, 140, 158],
    cx = 100,
    spacing = 18;

  SEED_ROWS.forEach((num, rowIdx) => {
    const startX = cx - ((num - 1) * spacing) / 2;

    for (let i = 0; i < num; i++) {

      const on = idx < filled;
      idx++;

      const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

      el.setAttribute('cx', startX + i * spacing);
      el.setAttribute('cy', rowY[rowIdx]);
      el.setAttribute('r', 6.4);

      let color = '#3D4C3F';

      if (on) {
        if (colorPhase !== undefined) {
          const t = Math.min(1, colorPhase);

          const rC = Math.round(74 + (194 - 74) * t);
          const gC = Math.round(122 + (50 - 122) * t);
          const bC = Math.round(74 + (74 - 74) * t);

          color = `rgb(${rC},${gC},${bC})`;
        } else {
          color = '#C23A54';
        }
      }

      el.setAttribute('fill', color);
      el.setAttribute('class', 'seed ' + (on ? 'on' : 'off'));

      group.appendChild(el);
    }
  });
}
