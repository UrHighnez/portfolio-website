const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav__link');
const toggleBtn = document.getElementById('theme-toggle');

// Theme toggle. The initial theme is applied inline in <head> before paint
// (see the bootstrap script there) and the logo swaps purely via CSS, so this
// only needs to flip and persist the choice.
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

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

// Portfolio slider
function initSlider() {
    const slider = document.getElementById('slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    let current = 0;
    const AUTO_MS = 5000;
    let autoId = null;

    // Lazy-load backgrounds from data-bg the first time a slide is needed, so the
    // page no longer pulls every (large) image up front. The active slide keeps its
    // inline background so it paints immediately and still works without JS.
    const ensureLoaded = i => {
        const s = slides[i];
        if (s && s.dataset.bg) {
            s.style.backgroundImage = `url('${s.dataset.bg}')`;
            delete s.dataset.bg;
        }
    };
    const preloadNext = i => {
        const next = () => ensureLoaded((i + 1) % slides.length);
        if ('requestIdleCallback' in window) {
            requestIdleCallback(next, {timeout: 2000});
        } else {
            setTimeout(next, 1000);
        }
    };
    const show = i => {
        ensureLoaded(i);
        preloadNext(i);
        slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    };
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
} else {
    initSlider();
}
