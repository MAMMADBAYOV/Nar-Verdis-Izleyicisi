/* ============ AI Köməkçi (Cloudflare Worker vasitəsilə) ============ */

const AI_WORKER_URL = 'https://nar-ai.mammadbayov-13.workers.dev';

let aiMode = 'nutrition'; // 'nutrition' | 'workout'
let aiHistory = { nutrition: [], workout: [] };

function aiAddMessage(role, text, loading) {
  const box = document.getElementById('aiChatMessages');
  const el = document.createElement('div');
  el.className = 'ai-msg ' + (role === 'user' ? 'user' : 'bot') + (loading ? ' loading' : '');
  el.textContent = text;
  if (loading) el.id = 'aiLoadingMsg';
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  return el;
}

function aiRenderHistory() {
  const box = document.getElementById('aiChatMessages');
  box.innerHTML = '';
  const list = aiHistory[aiMode];
  if (list.length === 0) {
    const hint = aiMode === 'nutrition'
      ? 'Salam! Qidalanma haqqında nə bilmək istəyirsən? 🥗'
      : 'Salam! Məşqlə bağlı nə soruşmaq istəyirsən? 💪';
    aiAddMessage('bot', hint, false);
    return;
  }
  list.forEach((m) => aiAddMessage(m.role === 'user' ? 'user' : 'bot', m.content, false));
}

function aiSwitchMode(mode) {
  aiMode = mode;
  document.getElementById('aiTabNutrition').classList.toggle('on', mode === 'nutrition');
  document.getElementById('aiTabWorkout').classList.toggle('on', mode === 'workout');
  aiRenderHistory();
}

async function aiSendMessage() {
  const input = document.getElementById('aiChatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  aiAddMessage('user', text, false);
  aiHistory[aiMode].push({ role: 'user', content: text });

  const loadingEl = aiAddMessage('bot', 'Yazır...', true);

  let context = {};
  try {
    if (aiMode === 'nutrition' && typeof profile !== 'undefined' && profile) {
      context = {
        goal: profile.goal,
        height: profile.height,
        weight: profile.weight
      };
    }
  } catch (e) {}

  try {
    const res = await fetch(AI_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: aiMode,
        message: text,
        history: aiHistory[aiMode].slice(0, -1),
        context
      })
    });

    const data = await res.json();
    const reply = data.reply || 'Bağışla, cavab ala bilmədim. Yenidən cəhd et.';

    loadingEl.remove();
    aiAddMessage('bot', reply, false);
    aiHistory[aiMode].push({ role: 'assistant', content: reply });

  } catch (e) {
    loadingEl.remove();
    aiAddMessage('bot', 'Bağlantı xətası oldu, yenidən cəhd et.', false);
    console.log('AI chat error:', e);
  }
}

function wireAiChat() {
  const fab = document.getElementById('aiFab');
  const modal = document.getElementById('aiChatModal');
  const closeBtn = document.getElementById('aiChatCloseBtn');
  const sendBtn = document.getElementById('aiChatSend');
  const input = document.getElementById('aiChatInput');
  const tabNutrition = document.getElementById('aiTabNutrition');
  const tabWorkout = document.getElementById('aiTabWorkout');

  if (!fab) return;

  fab.onclick = () => {
    modal.classList.add('show');
    aiRenderHistory();
  };
  closeBtn.onclick = () => modal.classList.remove('show');
  sendBtn.onclick = aiSendMessage;
  input.onkeydown = (e) => { if (e.key === 'Enter') aiSendMessage(); };
  tabNutrition.onclick = () => aiSwitchMode('nutrition');
  tabWorkout.onclick = () => aiSwitchMode('workout');
}

wireAiChat();