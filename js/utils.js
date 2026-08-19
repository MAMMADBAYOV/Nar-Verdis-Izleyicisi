/* ============ Storage polyfill ============ */
/* =========================================================
   Storage Polyfill
   Browser fallback when Claude Artifact Storage is unavailable.
========================================================= */
const STORAGE_PREFIX = "nar_storage_";

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(STORAGE_PREFIX + key);

      if (value === null) {
        throw new Error(`Key not found: ${key}`);
      }

      return {
        key,
        value,
        shared: false
      };
    },

    async set(key, value) {
      localStorage.setItem(STORAGE_PREFIX + key, value);

      return {
        key,
        value,
        shared: false
      };
    },

    async delete(key) {
      localStorage.removeItem(STORAGE_PREFIX + key);

      return {
        key,
        deleted: true,
        shared: false
      };
    },

    async list(prefix = "") {
      const keys = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(STORAGE_PREFIX + prefix)) {
          keys.push(key.slice(STORAGE_PREFIX.length));
        }
      }

      return {
        keys,
        prefix,
        shared: false
      };
    }
  };
}

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

// Updates the soft glow behind the pomegranate body based on how full it is,
// and toggles the "full" state that triggers the burst animation at 100%.
function updateNarGlow(glowId, filled, total, svgId) {
  const glow = document.getElementById(glowId);
  const svg = document.getElementById(svgId);
  if (!glow || !svg) return;
  const frac = total > 0 ? Math.min(1, filled / total) : 0;
  glow.style.opacity = (frac * 0.6).toFixed(2);
  if (frac >= 1) svg.classList.add('full');
  else svg.classList.remove('full');
}
