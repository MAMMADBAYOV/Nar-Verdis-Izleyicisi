/* ============ Firebase Auth + Firestore storage ============ */

const firebaseConfig = {
  apiKey: "AIzaSyAohcO0b1Clq0U_qMv5f5vLuX2naQTOEpY",
  authDomain: "narr-e48d4.firebaseapp.com",
  projectId: "narr-e48d4",
  storageBucket: "narr-e48d4.firebasestorage.app",
  messagingSenderId: "1018743767412",
  appId: "1:1018743767412:web:f57d7bcf0e59ff97c0ec21",
  measurementId: "G-4RBCXPLRNP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function makeFirestoreStorage(uid) {
  const col = db.collection('users').doc(uid).collection('kv');
  return {
    async get(key) {
      const doc = await col.doc(key).get();
      if (!doc.exists) throw new Error('Key not found: ' + key);
      return { key, value: doc.data().value, shared: false };
    },
    async set(key, value) {
      await col.doc(key).set({ value });
      return { key, value, shared: false };
    },
    async delete(key) {
      await col.doc(key).delete();
      return { key, deleted: true, shared: false };
    },
    async list(prefix = '') {
      const snap = await col.get();
      const keys = [];
      snap.forEach(d => { if (d.id.startsWith(prefix)) keys.push(d.id); });
      return { keys, prefix, shared: false };
    }
  };
}

function showAuthGate() {
  const gate = document.getElementById('authGate');
  if (gate) gate.classList.add('show');
  document.body.classList.add('auth-locked');
}
function hideAuthGate() {
  const gate = document.getElementById('authGate');
  if (gate) gate.classList.remove('show');
  document.body.classList.remove('auth-locked');
}
function setAuthGateMsg(text) {
  const el = document.getElementById('authGateMsg');
  if (el) el.textContent = text || '';
}

let appStarted = false;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    window.storage = makeFirestoreStorage(user.uid);
    const nameEl = document.getElementById('authUserName');
    if (nameEl) nameEl.textContent = user.displayName || user.email || '';
    hideAuthGate();
    if (!appStarted && typeof initApp === 'function') {
      appStarted = true;
      initApp();
    }
  } else {
    showAuthGate();
  }
});

function wireSignInButton() {
  const btn = document.getElementById('googleSignInBtn');
  if (!btn) return;
  btn.onclick = async () => {
    setAuthGateMsg('');
    btn.disabled = true;
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (e) {
      setAuthGateMsg('Giriş alınmadı, yenidən cəhd et.');
      console.error(e);
    }
    btn.disabled = false;
  };
}

function wireSignOutButton() {
  const btn = document.getElementById('signOutBtn');
  if (!btn) return;
  btn.onclick = async () => {
    await auth.signOut();
    window.location.reload();
  };
}

/* ============ Email/Parol ============ */

let authMode = 'signin'; // 'signin' | 'signup'

function translateAuthError(e) {
  const code = e && e.code;
  switch (code) {
    case 'auth/invalid-email': return 'Email düzgün deyil.';
    case 'auth/missing-password':
    case 'auth/weak-password': return 'Parol ən azı 6 simvol olmalıdır.';
    case 'auth/email-already-in-use': return 'Bu email artıq qeydiyyatdan keçib. Daxil ol.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password': return 'Email və ya parol yanlışdır.';
    case 'auth/user-not-found': return 'Bu email ilə hesab tapılmadı.';
    case 'auth/too-many-requests': return 'Çox sayda cəhd edildi, bir az sonra yenidən sına.';
    default: return 'Xəta baş verdi, yenidən cəhd et.';
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const submitBtn = document.getElementById('emailAuthSubmitBtn');
  const toggleWrap = document.getElementById('authModeToggle');
  if (!submitBtn || !toggleWrap) return;
  if (mode === 'signup') {
    submitBtn.textContent = 'Qeydiyyatdan keç';
    toggleWrap.innerHTML = 'Hesabın var? <a href="#" id="authModeToggleLink">Daxil ol</a>';
  } else {
    submitBtn.textContent = 'Daxil ol';
    toggleWrap.innerHTML = 'Hesabın yoxdur? <a href="#" id="authModeToggleLink">Qeydiyyatdan keç</a>';
  }
  wireAuthModeToggleLink();
  setAuthGateMsg('');
}

function wireAuthModeToggleLink() {
  const link = document.getElementById('authModeToggleLink');
  if (!link) return;
  link.onclick = (e) => {
    e.preventDefault();
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };
}

function wireEmailAuthForm() {
  const form = document.getElementById('emailAuthForm');
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    setAuthGateMsg('');
    const email = document.getElementById('authEmailInput').value.trim();
    const password = document.getElementById('authPasswordInput').value;
    const submitBtn = document.getElementById('emailAuthSubmitBtn');
    submitBtn.disabled = true;
    try {
      if (authMode === 'signup') {
        await auth.createUserWithEmailAndPassword(email, password);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
    } catch (e2) {
      setAuthGateMsg(translateAuthError(e2));
      console.error(e2);
    }
    submitBtn.disabled = false;
  };
}

function wireForgotPasswordLink() {
  const link = document.getElementById('forgotPasswordLink');
  if (!link) return;
  link.onclick = async (e) => {
    e.preventDefault();
    setAuthGateMsg('');
    const email = document.getElementById('authEmailInput').value.trim();
    if (!email) {
      setAuthGateMsg('Əvvəlcə email daxil et, sonra "Şifrəni unutmusan?" bas.');
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      setAuthGateMsg('Şifrə bərpa linki email-ə göndərildi.');
    } catch (e2) {
      setAuthGateMsg(translateAuthError(e2));
      console.error(e2);
    }
  };
}

wireSignInButton();
wireSignOutButton();
wireEmailAuthForm();
wireForgotPasswordLink();
wireAuthModeToggleLink();