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
