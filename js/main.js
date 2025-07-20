// ===============================
// = Coreltech IT Solutions      =
// = Archivo: main.js            =
// = Funciones básicas iniciales =
// ===============================

// 1. Menú responsive (mobile toggle)
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelector('.nav-links');

    // Si hay un botón de menú móvil (más adelante lo agregamos), lo activamos
    window.toggleMenu = function () {
        navLinks.classList.toggle('active');
    };
});

// 2. Inicializar AOS (Animaciones en Scroll)
document.addEventListener('DOMContentLoaded', function () {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    } else {
        console.warn('AOS no está cargado. Las animaciones no se aplicarán.');
    }
});