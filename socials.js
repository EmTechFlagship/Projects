// Socials page: scroll-triggered staggered reveal for the social cards.
(() => {
    const cards = document.querySelectorAll('.social-card');
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No observer / reduced motion: just show everything.
    if (reducedMotion || !('IntersectionObserver' in window)) {
        cards.forEach((card) => card.classList.add('is-visible', 'loaded'));
        return;
    }

    const REVEAL_DURATION = 700; // must match --reveal-duration in design.css

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const card = entry.target;
            card.classList.add('is-visible');
            observer.unobserve(card);

            // Once the animation (delay + duration) has finished, drop the
            // animation so hover transforms work again.
            const delay = parseInt(getComputedStyle(card).getPropertyValue('--reveal-delay'), 10) || 0;
            setTimeout(() => card.classList.add('loaded'), delay + REVEAL_DURATION + 50);
        }
    }, { threshold: 0.15 });

    cards.forEach((card) => observer.observe(card));
})();