// Automated Material 3 theme: follows the system light/dark preference.
(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Auto-highlight the current page in the topbar (prevents stale or wrong active states)
    (function highlightCurrentPage() {
        const current = location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.topbar a').forEach((link) => {
            const href = (link.getAttribute('href') || '').split('/').pop();
            link.classList.toggle('active', href === current);
        });
    })();

    function applyTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    // Apply the current system preference on load
    applyTheme(darkQuery.matches);

    // React to system theme changes while the page is open
    if (darkQuery.addEventListener) {
        darkQuery.addEventListener('change', (event) => applyTheme(event.matches));
    } else if (darkQuery.addListener) {
        // Fallback for older browsers
        darkQuery.addListener((event) => applyTheme(event.matches));
    }
})();