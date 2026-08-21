// Site preferences: theme (auto/light/dark), text size, accent color.
// Persisted in localStorage under 'emapple.settings' and applied on every page.
(() => {
    const STORE_KEY = 'emapple.settings';
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    /* ---------- Persistence ---------- */
    function readSettings() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
    }
    function saveSettings(s) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* private mode */ }
    }
    function getPrefs() {
        const s = readSettings();
        return {
            theme: s.theme || 'auto',        // auto | light | dark
            textSize: normalizeTextSize(s.textSize), // percentage of base (default 100)
            accent: s.accent || 'blue',      // blue | purple | green | orange | pink | red
        };
    }
    // Accepts the current percentage (number/string) or legacy labels.
    function normalizeTextSize(v) {
        const n = Number(v);
        if (v !== '' && v != null && !Number.isNaN(n) && isFinite(n)) {
            return Math.min(150, Math.max(80, n));
        }
        if (v === 'small') return 85;
        if (v === 'large') return 120;
        return 100; // default / normal
    }
    const prefs = getPrefs();

    /* ---------- Apply ---------- */
    function applyTheme(isSystemDark) {
        const theme = prefs.theme === 'auto' ? (isSystemDark ? 'dark' : 'light') : prefs.theme;
        document.documentElement.setAttribute('data-theme', theme);
    }
    function applyAppearance() {
        applyTheme(darkQuery.matches);
        applyTextSize(prefs.textSize);
        document.documentElement.setAttribute('data-accent', prefs.accent);
    }
    // Scale the root font-size so every rem-based size (and text) scales.
    function applyTextSize(percent) {
        document.documentElement.style.fontSize = (16 * percent / 100) + 'px';
    }

    /* ---------- Frosted topbar: transparent at top, translucent + blur when scrolled ---------- */
    (function topbarScrolled() {
        const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    })();

    /* ---------- Auto-highlight the current page in the topbar ---------- */
    (function highlightCurrentPage() {
        const current = location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.topbar a').forEach((link) => {
            const href = (link.getAttribute('href') || '').split('/').pop();
            link.classList.toggle('active', href === current);
        });
    })();

    /* ---------- Init ---------- */
    applyAppearance();

    // React to system theme changes while the page is open (auto mode only).
    if (darkQuery.addEventListener) {
        darkQuery.addEventListener('change', (e) => {
            if (prefs.theme === 'auto') applyTheme(e.matches);
        });
    } else if (darkQuery.addListener) {
        darkQuery.addListener((e) => {
            if (prefs.theme === 'auto') applyTheme(e.matches);
        });
    }

    /* ---------- Settings page controls ---------- */
    const settingsPage = document.getElementById('settings');
    if (settingsPage) {
        const buttons = Array.from(settingsPage.querySelectorAll('[data-setting]'));

        // Mark the saved values as selected.
        buttons.forEach((btn) => {
            const isActive = btn.dataset.value === prefs[btn.dataset.setting];
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const setting = btn.dataset.setting;
                const value = btn.dataset.value;
                prefs[setting] = value;
                saveSettings({ theme: prefs.theme, textSize: prefs.textSize, accent: prefs.accent });

                if (setting === 'theme') applyTheme(darkQuery.matches);
                if (setting === 'accent') document.documentElement.setAttribute('data-accent', prefs.accent);

                buttons.forEach((other) => {
                    const isActive = other === btn;
                    other.classList.toggle('active', isActive);
                    other.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });
            });
        });

        // Text-size slider (continuous percentage, 80–150%).
        const slider = document.getElementById('textSizeSlider');
        const valueLabel = document.getElementById('textSizeValue');
        if (slider) {
            slider.value = prefs.textSize;
            if (valueLabel) valueLabel.textContent = Math.round(prefs.textSize) + '%';
            slider.addEventListener('input', () => {
                const percent = Number(slider.value);
                prefs.textSize = percent;
                saveSettings({ theme: prefs.theme, textSize: prefs.textSize, accent: prefs.accent });
                applyTextSize(percent);
                if (valueLabel) valueLabel.textContent = Math.round(percent) + '%';
            });
        }
    }
})();