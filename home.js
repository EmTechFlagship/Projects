// Home page: stagger the entrance animation of the bento cards.
(() => {
    const cards = document.querySelectorAll('.main-content > .card, .main-content .bento-row > .card');
    if (!cards.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        cards.forEach((card) => card.classList.add('loaded'));
        return;
    }

    cards.forEach((card, index) => {
        // Stagger each card slightly; match the delay value in CSS.
        const delay = index * 120;
        card.style.animationDelay = `${delay}ms`;
        // Drop the entrance animation after it finishes so hover effects work.
        card.addEventListener('animationend', () => card.classList.add('loaded'), { once: true });
    });
})();