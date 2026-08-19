/* ============ Bildirişlər (FCM) ============ */

const VAPID_KEY = 'BFXKSPIm8wr3vLfytNg8NxaW9Q7he6lESiAm_r79eDwAxXm8aNgADZkDmEqcvlU1fSa9wlLYD7T4S63MAA6yKi4';

let messaging = null;
try {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
  }
} catch (e) {
  console.log('Bu brauzer bildirişləri dəstəkləmir.', e);
}

function notifStatusText(perm) {
  if (perm === 'granted') return 'Bildirişlər aktivdir ✅';
  if (perm === 'denied') return 'Bildirişlər brauzerdə bloklanıb — brauzer ayarlarından aç.';
  return 'Bildirişlər hələ aktiv deyil.';
}

function renderNotifUI() {
  const btn = document.getElementById('enableNotifBtn');
  const statusEl = document.getElementById('notifStatus');
  if (!btn || !statusEl) return;

  if (!messaging || typeof Notification === 'undefined') {
    statusEl.textContent = 'Bu brauzer bildirişləri dəstəkləmir.';
    btn.style.display = 'none';
    return;
  }

  const perm = Notification.permission;
  statusEl.textContent = notifStatusText(perm);
  btn.style.display = (perm === 'default') ? 'inline-block' : 'none';
}

async function saveFcmToken(uid, token) {
  try {
    await db.collection('users').doc(uid).set(
      { fcmToken: token, fcmTokenUpdatedAt: Date.now() },
      { merge: true }
    );
  } catch (e) {
    console.log('Token saxlanmadı:', e);
  }
}

async function enableNotifications() {
  if (!messaging) return;
  const statusEl = document.getElementById('notifStatus');
  const btn = document.getElementById('enableNotifBtn');

  btn.disabled = true;

  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      renderNotifUI();
      btn.disabled = false;
      return;
    }

    const token = await messaging.getToken({
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg
    });

    const user = auth.currentUser;
    if (user && token) {
      await saveFcmToken(user.uid, token);
    }

    renderNotifUI();

  } catch (e) {
    console.log('Bildiriş aktivləşdirilə bilmədi:', e);
    if (statusEl) statusEl.textContent = 'Bildiriş aktivləşdirilə bilmədi, yenidən cəhd et.';
  }

  btn.disabled = false;
}

function wireNotifButton() {
  const btn = document.getElementById('enableNotifBtn');
  if (!btn) return;
  btn.onclick = enableNotifications;
}

if (messaging) {
  messaging.onMessage((payload) => {
    /* Tətbiq açıq ikən gələn bildirişi ekranda göstəririk */
    const title = (payload.notification && payload.notification.title) || 'Nar';
    const body = (payload.notification && payload.notification.body) || '';
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  });
}

wireNotifButton();