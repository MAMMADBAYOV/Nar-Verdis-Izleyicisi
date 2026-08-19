/* ============ Habits ============ */

function render() {
  const done = completedCount(state.log);
  renderSeedsInto('seedGroup', done, HABITS.length);
  updateNarGlow('narGlow', done, HABITS.length, 'narSvg');
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
  const grid = document.getElementById('weekGrid');

  if (!grid) return;

  grid.innerHTML = '';

  const dn = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş'];

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = dateNDaysAgo(i);
    days.push({ d, key: todayKey(d) });
  }

  const results = await Promise.all(days.map(async ({ key }) => {
    try {
      const r = await window.storage.get('workout-log:' + key, false);
      return !!(r && r.value === 'true');
    } catch (e) {
      return false;
    }
  }));

  days.forEach(({ d, key }, idx) => {
    const workoutDone = results[idx];

    const de = document.createElement('div');
    de.className = 'day';
    de.style.cursor = 'pointer';

    de.onclick = () => selectHabitDate(key);

    const box = document.createElement('div');

    let cls = 'box';

    if (workoutDone) {
      cls += ' full';
    }

    if (key === state.date) {
      cls += ' today';
    }

    box.className = cls;

    const lb = document.createElement('div');
    lb.className = 'dlabel';
    lb.textContent = dn[d.getDay()];

    de.appendChild(box);
    de.appendChild(lb);

    grid.appendChild(de);
  });
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

  const svgNS = 'http://www.w3.org/2000/svg';
  const gradId = groupId + 'SeedGloss';

  // Glossy radial gradient shared by every "on" seed in this group — gives each
  // seed a gem-like highlight instead of a flat dot.
  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'radialGradient');
  grad.setAttribute('id', gradId);
  grad.setAttribute('cx', '35%');
  grad.setAttribute('cy', '30%');
  grad.setAttribute('r', '75%');
  const stops = [
    ['0%', '#FF9FAE'],
    ['35%', '#F0405C'],
    ['100%', '#A81638']
  ];
  stops.forEach(([offset, stopColor]) => {
    const stop = document.createElementNS(svgNS, 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', stopColor);
    grad.appendChild(stop);
  });
  defs.appendChild(grad);
  group.appendChild(defs);

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

      const seedCx = startX + i * spacing;
      const seedCy = rowY[rowIdx];

      const el = document.createElementNS(svgNS, 'circle');

      el.setAttribute('cx', seedCx);
      el.setAttribute('cy', seedCy);
      el.setAttribute('r', 6.6);

      let color = '#3D4C3F';

      if (on) {
        if (colorPhase !== undefined) {
          const t = Math.min(1, colorPhase);

          const rC = Math.round(96 + (228 - 96) * t);
          const gC = Math.round(176 + (44 - 176) * t);
          const bC = Math.round(96 + (66 - 96) * t);

          color = `rgb(${rC},${gC},${bC})`;
        } else {
          color = `url(#${gradId})`;
        }
      }

      el.setAttribute('fill', color);
      el.setAttribute('class', 'seed ' + (on ? 'on' : 'off'));

      group.appendChild(el);

      // Small glossy highlight on top of every filled seed — this is what
      // makes each seed read as a juicy, rounded gem instead of a flat dot.
      if (on) {
        const shine = document.createElementNS(svgNS, 'ellipse');
        shine.setAttribute('cx', seedCx - 1.9);
        shine.setAttribute('cy', seedCy - 2.3);
        shine.setAttribute('rx', 2.1);
        shine.setAttribute('ry', 1.3);
        shine.setAttribute('fill', 'rgba(255,255,255,0.6)');
        shine.setAttribute('class', 'seed-shine');
        group.appendChild(shine);
      }
    }
  });
}