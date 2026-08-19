/**
 * Gündə 1 dəfə (GitHub Actions vasitəsilə) işə düşür.
 * Hər istifadəçinin son məşq tarixinə baxır və YALNIZ müəyyən
 * "mərhələ" günlərində (2, 3, 7, 14, 21, 30 gün fasilə,
 * ya da 3, 7, 14, 30, 60, 100 günlük seriya) mehriban bir
 * bildiriş göndərir. Hər gün göndərmir.
 */

const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* ============ Mesaj mətnləri ============ */

const MESSAGES_2_3_DAYS = [
  'Salam! Bir nəfəs aldıq, indi davam edək? 🌱',
  'Nar səni gözləyir 👋 Bugün qısa bir məşqə nə deyərsən?',
  'Hər şey qaydasındadır, sadəcə bir xəbər ver: bugün hazırsan?'
];

const MESSAGES_1_WEEK = [
  'Hər nə qədər keçsə, biz burdayıq 🌿 istəyəndə qayıt.',
  'Bir həftədir səni görmədik, ümid edirəm hər şey yaxşıdır. Hazır olanda buradayıq.',
  'Fasilə vərdişin bir hissəsidir, problem deyil. İstəsən bir addımla başlayaq?'
];

const MESSAGES_LONG = [
  'Uzun fasilə oldu, amma bu bitən bir şey deyil — sadəcə fasilə. İstəsən sıfırdan, kiçik addımla başlaya bilərik.',
  'Hər şey sıfırlanmayıb, sadəcə gözləyir. Hazır olanda qayıt, tam ardındayıq.'
];

const MESSAGES_STREAK = (n) => [
  `${n} günlük seriya! Nar səninlə fəxr edir 🌱`,
  `${n} gündür burdasan — gözəl gedir!`
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ============ Tarix köməkçiləri (Bakı vaxtı, UTC+4) ============ */

function bakuTodayKey() {
  const now = new Date(Date.now() + 4 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function addDaysKey(dateKey, delta) {
  const d = new Date(dateKey + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromKey, toKey) {
  const a = new Date(fromKey + 'T00:00:00Z');
  const b = new Date(toKey + 'T00:00:00Z');
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

const ABSENCE_MILESTONES = [2, 3, 7, 14, 21, 30];
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

/* ============ Əsas məntiq ============ */

async function getWorkoutDates(uid) {
  const snap = await db
    .collection('users').doc(uid).collection('kv')
    .where(admin.firestore.FieldPath.documentId(), '>=', 'workout-log:')
    .where(admin.firestore.FieldPath.documentId(), '<', 'workout-log:~')
    .get();

  const dates = [];
  snap.forEach((doc) => {
    const data = doc.data();
    if (data && data.value === 'true') {
      dates.push(doc.id.replace('workout-log:', ''));
    }
  });
  dates.sort();
  return dates;
}

function computeStreak(dates, todayKey) {
  const set = new Set(dates);
  let cursor = set.has(todayKey) ? todayKey : addDaysKey(todayKey, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

async function sendNotification(uid, token, body) {
  try {
    await admin.messaging().send({
      token,
      notification: { title: 'Nar', body }
    });
    return true;
  } catch (e) {
    console.log(`Göndərilmədi (${uid}):`, e.message);
    if (
      e.code === 'messaging/registration-token-not-registered' ||
      e.code === 'messaging/invalid-registration-token'
    ) {
      await db.collection('users').doc(uid).update({
        fcmToken: admin.firestore.FieldValue.delete()
      });
    }
    return false;
  }
}

async function run() {
  const todayKey = bakuTodayKey();
  const usersSnap = await db.collection('users').get();

  console.log(`Bugün: ${todayKey}, istifadəçi sayı: ${usersSnap.size}`);

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const data = userDoc.data();
    const token = data.fcmToken;

    if (!token) continue;
    if (data.lastReminderSentDate === todayKey) continue;

    const dates = await getWorkoutDates(uid);
    if (dates.length === 0) continue;

    const lastWorkoutKey = dates[dates.length - 1];
    const gap = daysBetween(lastWorkoutKey, todayKey);

    let message = null;

    if (ABSENCE_MILESTONES.includes(gap)) {
      if (gap <= 3) message = pick(MESSAGES_2_3_DAYS);
      else if (gap === 7) message = pick(MESSAGES_1_WEEK);
      else message = pick(MESSAGES_LONG);
    } else {
      const streak = computeStreak(dates, todayKey);
      if (STREAK_MILESTONES.includes(streak)) {
        message = pick(MESSAGES_STREAK(streak));
      }
    }

    if (!message) continue;

    const sent = await sendNotification(uid, token, message);
    if (sent) {
      await db.collection('users').doc(uid).update({
        lastReminderSentDate: todayKey
      });
      console.log(`Göndərildi (${uid}): ${message}`);
    }
  }

  console.log('Bitdi.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});