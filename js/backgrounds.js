/* Two procedural canvas backgrounds sharing one value-noise / fBm.
   Colors are read from the active CSS variables each frame, so the
   theme switch is picked up automatically. DPR-scaled for sharpness,
   paused outside the viewport and under prefers-reduced-motion. */
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- shared value-noise / fBm ---- */
    function hash(x, y) {
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }
    function noise(x, y) {
        const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
        const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y, oct) {
        oct = oct || 4;
        let s = 0, amp = 0.5, f = 1;
        for (let i = 0; i < oct; i++) { s += amp * noise(x * f, y * f); f *= 2; amp *= 0.5; }
        return s;
    }

    /* ---- color helpers ---- */
    const cs = getComputedStyle(document.documentElement);
    function readRGB(name) {
        const v = cs.getPropertyValue(name).trim();
        if (v.charAt(0) === '#') {
            let h = v.slice(1);
            if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
            const int = parseInt(h, 16);
            return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
        }
        const m = v.match(/[\d.]+/g);
        return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
    }
    const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';

    function setup(canvas) {
        const ctx = canvas.getContext('2d');
        const o = { canvas, ctx, w: 1, h: 1 };
        o.resize = function () {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const r = canvas.getBoundingClientRect();
            o.w = Math.max(1, Math.round(r.width));
            o.h = Math.max(1, Math.round(r.height));
            canvas.width = o.w * dpr;
            canvas.height = o.h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        o.resize();
        return o;
    }

    /* ---- HERO: terrain (stacked filled contour lines) ---- */
    function drawTerrain(o, t) {
        const ctx = o.ctx, w = o.w, h = o.h;
        ctx.clearRect(0, 0, w, h);
        const bg = readRGB('--bg'), accent = readRGB('--accent');
        const lines = 30;
        for (let i = 0; i < lines; i++) {
            const prog = i / (lines - 1);
            const yBase = h * 0.06 + prog * h * 1.02;
            ctx.beginPath();
            ctx.moveTo(0, h + 4);
            for (let x = 0; x <= w; x += 4) {
                const n = fbm(x * 0.0017 + i * 0.42, t * 0.1 + i * 0.1);
                ctx.lineTo(x, yBase - (n - 0.5) * (30 + i * 3.6) * 2.6);
            }
            ctx.lineTo(w, h + 4);
            ctx.closePath();
            ctx.fillStyle = rgba(mix(bg, accent, 0.12 + prog * 0.5), 1);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(accent, 0.12 + prog * 0.4);
            ctx.stroke();
        }
    }

    /* ---- STACK: dot-matrix (LED grid, size & alpha from fBm) ---- */
    function drawDots(o, t) {
        const ctx = o.ctx, w = o.w, h = o.h;
        ctx.clearRect(0, 0, w, h);
        const accent = readRGB('--accent');
        const base = 'rgb(' + (accent[0] | 0) + ',' + (accent[1] | 0) + ',' + (accent[2] | 0) + ')';
        ctx.fillStyle = base;
        const gap = 24;
        for (let y = gap / 2; y < h; y += gap) {
            for (let x = gap / 2; x < w; x += gap) {
                const n = fbm(x * 0.006 + t * 0.15, y * 0.006 - t * 0.1, 3);
                const val = Math.max(0, (n - 0.42) / 0.5);
                if (val <= 0.02) continue;
                ctx.globalAlpha = 0.13 + val * 0.45;
                ctx.beginPath();
                ctx.arc(x, y, 0.7 + val * 3.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    function run(id, draw, speed) {
        const el = document.getElementById(id);
        if (!el) return;
        const o = setup(el);
        let t = Math.random() * 100;
        let raf = null, visible = true;

        const frame = () => { draw(o, t); t += speed; raf = requestAnimationFrame(frame); };
        const start = () => { if (raf === null && visible) raf = requestAnimationFrame(frame); };
        const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { o.resize(); draw(o, t); }, 150);
        }, { passive: true });

        if (reduceMotion) { draw(o, t); return; }

        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            visible ? start() : stop();
        }, { threshold: 0 }).observe(el);

        start();
    }

    run('bg-terrain', drawTerrain, 0.022);
    run('bg-dots', drawDots, 0.02);
})();
