// ========================================
// MENU HAMBURGUESA - MOBILE
// ========================================

// Obtener elementos del DOM
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

// Toggle del menú al hacer click en hamburguesa
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Cerrar menú al hacer click en un enlace
const links = document.querySelectorAll('.nav__link');
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});
