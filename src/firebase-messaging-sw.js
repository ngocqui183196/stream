importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");


const firebaseConfig_testm4s = {
  // to cut the chase, just copy it from your Firebase Project settings
  apiKey: "AIzaSyBxVraR3Cn-d9k6DYGNN4tGH2mdZWk0XKk",
  authDomain: "testm4s.firebaseapp.com",
  projectId: "testm4s",
  storageBucket: "testm4s.appspot.com",
  messagingSenderId: "512504323812",
  appId: "1:512504323812:web:4c03debcd7e54f173516f1",
  measurementId: "G-3DY9B18Z2Y",
};

const firebaseConfig_demo_web_messaging_noti
= {
    // to cut the chase, just copy it from your Firebase Project settings
    apiKey: "AIzaSyDuqEviMyDYv369oD112QDUT5hnTmo2Xa8",
    authDomain: "fir-web-messaging-noti.firebaseapp.com",
    projectId: "fir-web-messaging-noti",
    storageBucket: "fir-web-messaging-noti.firebasestorage.app",
    messagingSenderId: "689094961998",
    appId: "1:689094961998:web:a6a7749dcea2dbdd734c1f",
    // measurementId: "G-3DY9B18Z2Y",
};
console.log('Noce vào đây nữa này')

const app = firebase.initializeApp(firebaseConfig_demo_web_messaging_noti);
const messaging = firebase.messaging();

messaging.onMessage(payload => console.log(payload))

// Đây là hàm lắng nghe message khi tab trình duyệt không được mở.
messaging.onBackgroundMessage( (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', {...payload});
  const notificationTitle = payload['notification']['title'];
  const notificationOptions = {
    body: payload['notification']['body'],
    icon: '/firebase-logo.png'
  }

  self.registration.showNotification(notificationTitle + ' chê', notificationOptions)
})
