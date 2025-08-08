// /app/js/auth.js
firebase.auth().onAuthStateChanged((user) => {
  const allowedDomains = ['coreltech.com']; // Solo correos autorizados
  const path = window.location.pathname;

  // Permitir acceso solo a /app si el usuario está autenticado y tiene correo válido
  if (path.startsWith('/app/')) {
    if (!user) {
      window.location.href = '/app/login.html';
    } else {
      const domain = user.email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        firebase.auth().signOut();
        alert('Acceso denegado. Usuario no autorizado.');
        window.location.href = '/app/login.html';
      }
    }
  }
});