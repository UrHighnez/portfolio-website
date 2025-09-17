const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav__link');
const toggleBtn = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const logoImg = document.getElementById('logo');

// Helper func for relative path
function getAssetPath(file) {
    const path = window.location.pathname;
    const prefix = path.includes('/portfolio/') ? '../' : '';
    return prefix + 'img/' + file;
}

// Theme
if (localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
} else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Logo
if (logoImg) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    logoImg.src = getAssetPath(currentTheme === 'dark' ? 'jkrieg-logo-dark.png' : 'jkrieg-logo-light.png');
}

// Theme
toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    if (logoImg) {
        logoImg.src = getAssetPath(newTheme === 'dark' ? 'jkrieg-logo-dark.png' : 'jkrieg-logo-light.png');
    }
});

// Navigation
if (navToggle) {
    navToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
    });
});

// Portfolio SLider
function initSlider() {
    const slider = document.getElementById('slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    let current = 0;
    const AUTO_MS = 5000;
    let autoId = null;

    const show = i => slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    const go = d => {
        current = (current + d + slides.length) % slides.length;
        show(current);
    };

    const nextBtn = document.querySelector('.portfolio-nav.right');
    const prevBtn = document.querySelector('.portfolio-nav.left');

    const start = () => {
        clearInterval(autoId);
        autoId = setInterval(() => go(1), AUTO_MS);
    };
    const stop = () => {
        clearInterval(autoId);
        autoId = null;
    };

    nextBtn?.addEventListener('click', e => {
        e.preventDefault();
        go(1);
        start();
    });
    prevBtn?.addEventListener('click', e => {
        e.preventDefault();
        go(-1);
        start();
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    show(current);
    start();

    console.debug('slides gefunden:', slides.length);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
} else {
    initSlider();
}
