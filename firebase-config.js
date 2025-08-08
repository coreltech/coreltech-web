// firebase-config.js
// Configuración de Firebase - CorelTech

const firebaseConfig = {
    apiKey: "AIzaSyBRlLI6jyodHvj_RSsKOjFF8B2HeM1UW7E",
    authDomain: "coreltechweb-contactos.firebaseapp.com",
    projectId: "coreltechweb-contactos",
    storageBucket: "coreltechweb-contactos.appspot.com",
    messagingSenderId: "597588902592",
    appId: "1:597588902592:web:c721408e00e62de26fe325"
  };

// Inicializa Firebase (solo si no está ya inicializado)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else if (typeof firebase === 'undefined') {
  console.error("Firebase SDK no está cargado. Verifica los script tags.");
}