/* Theme toggle, DE/EN language switch and the mobile nav.
   The initial theme is applied inline in <head> to avoid a flash. */
(function () {
    const root = document.documentElement;

    /* ---------- Theme ---------- */
    const themeBtn = document.getElementById('theme-btn');
    const syncThemeBtn = () => {
        const dark = root.dataset.theme === 'dark';
        themeBtn.textContent = dark ? '☀' : '☾';
        themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    if (themeBtn) {
        syncThemeBtn();
        themeBtn.addEventListener('click', () => {
            root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', root.dataset.theme);
            syncThemeBtn();
        });
    }

    /* ---------- Language (DE/EN via data-en / data-de) ---------- */
    const langBtn = document.getElementById('lang-btn');
    const supported = ['en', 'de'];

    const detectLang = () => {
        const saved = localStorage.getItem('lang');
        if (supported.includes(saved)) return saved;
        return (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
    };

    function setLang(lang) {
        root.lang = lang;
        document.querySelectorAll('[data-en]').forEach(el => {
            const val = el.dataset[lang];
            if (val != null) el.textContent = val;
        });
        // Rich text (keeps inline links/markup) — used for prose with embedded links
        document.querySelectorAll('[data-en-html]').forEach(el => {
            const val = el.dataset[lang + 'Html'];
            if (val != null) el.innerHTML = val;
        });
        if (langBtn) {
            langBtn.textContent = lang === 'de' ? 'EN' : 'DE';
            langBtn.setAttribute('aria-label', lang === 'de' ? 'Switch to English' : 'Auf Deutsch umschalten');
        }
        localStorage.setItem('lang', lang);
    }

    setLang(detectLang());
    if (langBtn) {
        langBtn.addEventListener('click', () => setLang(root.lang === 'de' ? 'en' : 'de'));
    }

    /* ---------- Mobile nav ---------- */
    const menuBtn = document.getElementById('menu-btn');
    const nav = document.getElementById('main-nav');
    if (menuBtn && nav) {
        const close = () => {
            document.body.classList.remove('nav-open');
            menuBtn.setAttribute('aria-expanded', 'false');
        };
        menuBtn.addEventListener('click', () => {
            const open = document.body.classList.toggle('nav-open');
            menuBtn.setAttribute('aria-expanded', String(open));
        });
        nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    }
})();
