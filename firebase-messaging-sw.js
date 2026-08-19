/* Bu fayl tətbiq bağlı olanda / arxa planda bildirişlərin gəlməsi üçündür. */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAohcO0b1Clq0U_qMv5f5vLuX2naQTOEpY",
  authDomain: "narr-e48d4.firebaseapp.com",
  projectId: "narr-e48d4",
  storageBucket: "narr-e48d4.firebasestorage.app",
  messagingSenderId: "1018743767412",
  appId: "1:1018743767412:web:f57d7bcf0e59ff97c0ec21"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Nar';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/icon-192.png'
  };
  self.registration.showNotification(title, options);
});