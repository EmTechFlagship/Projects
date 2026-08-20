(() => {
    const container = document.getElementById('projects');
    const filters = document.getElementById('filters');
    const slider = document.getElementById('filterSlider');
    if (!container) return;

    const username = 'EmTechFlagship';
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`;

    let repos = [];

    // Offline fallback so the page never gets stuck on "Loading..."
    const FALLBACK_REPOS = [
        {
            name: 'Projects',
            html_url: 'https://github.com/EmTechFlagship/Projects',
            description: 'This projects website repo',
            archived: false,
            disabled: false
        },
        {
            name: 'Empamine',
            html_url: 'https://github.com/EmTechFlagship/Empamine',
            description: 'Empamine is a semi-untethered jailbreak for iOS 15 to 27b5',
            archived: false,
            disabled: false
        },
        {
            name: 'EmYT',
            html_url: 'https://github.com/EmTechFlagship/EmYT',
            description: 'Build YouTube Plus (YTLite) with optional integrated tweaks',
            archived: false,
            disabled: false
        },
        {
            name: 'Bootstrap26',
            html_url: 'https://github.com/EmTechFlagship/Bootstrap26',
            description: 'A full featured bootstrap for iOS 15.0-26.5 A8-A19Pro & M1+M2 using roothide',
            archived: false,
            disabled: false
        },
        {
            name: 'ngrok-rdp',
            html_url: 'https://github.com/EmTechFlagship/ngrok-rdp',
            description: 'Free RDP via ngrok',
            archived: false,
            disabled: true
        }
    ];

    const filtersMap = {
        all: () => true,
        archived: (repo) => repo.archived,
        disabled: (repo) => repo.disabled,
        unavailable: (repo) => repo.archived || repo.disabled
    };

    function cardFor(repo, index) {
        const card = document.createElement('a');
        card.className = 'project-card';
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.style.animationDelay = `${index * 60}ms`;
        // Drop the entrance animation after it finishes so hover effects work
        card.addEventListener('animationend', () => card.classList.add('loaded'), { once: true });

        const name = document.createElement('h2');
        name.className = 'project-name';
        name.textContent = repo.name;

        const desc = document.createElement('p');
        desc.className = 'project-desc';
        desc.textContent = repo.description || 'No description provided';

        card.append(name, desc);

        if (repo.disabled) {
            card.classList.add('disabled');
            card.removeAttribute('href');
            card.style.pointerEvents = 'none';
            card.ariaLabel = `${repo.name} (disabled by GitHub)`;

            const overlay = document.createElement('div');
            overlay.className = 'disabled-overlay';

            const x = document.createElement('span');
            x.className = 'disabled-x';
            x.setAttribute('aria-hidden', 'true');
            x.textContent = '✕';

            const label = document.createElement('span');
            label.className = 'disabled-text';
            label.textContent = 'Disabled by GitHub';

            overlay.append(x, label);
            card.append(overlay);
        }

        return card;
    }

    function render(filter) {
        const visible = repos.filter(filtersMap[filter] || filtersMap.all);

        if (visible.length === 0) {
            container.innerHTML = '<p class="projects-status">No projects to show.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        visible.forEach((repo, index) => fragment.append(cardFor(repo, index)));
        container.replaceChildren(fragment);
    }

    function moveSlider(button) {
        if (!button || !slider) return;
        slider.style.left = `${button.offsetLeft}px`;
        slider.style.width = `${button.offsetWidth}px`;
    }

    function setFilter(filter) {
        filters.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        moveSlider(filters.querySelector('.filter-btn.active'));
        render(filter);
    }

    filters.addEventListener('click', (event) => {
        const button = event.target.closest('.filter-btn');
        if (button) setFilter(button.dataset.filter);
    });

    // Keep the slider aligned with the active button on resize
    window.addEventListener('resize', () => {
        moveSlider(filters.querySelector('.filter-btn.active'));
    });

    function showFallback(message) {
        repoSetup(FALLBACK_REPOS, message);
    }

    function repoSetup(list, note) {
        repos = list;
        render('all');
        if (note) {
            const status = document.createElement('p');
            status.className = 'projects-status';
            status.textContent = note;
            container.before(status);
        }
    }

    // Loading state
    container.innerHTML = '<p class="projects-status">Loading projects&hellip;</p>';

    // Fetch with a timeout so the page never hangs on "Loading..."
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal })
        .then((response) => {
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            clearTimeout(timeout);
            const list = Array.isArray(data) ? data : [];
            if (list.length === 0) {
                container.innerHTML = '<p class="projects-status">No projects found.</p>';
                return;
            }
            repos = list;
            // Position the slider on the initially active button after first paint
            requestAnimationFrame(() => setFilter('all'));
        })
        .catch((error) => {
            clearTimeout(timeout);
            if (error && error.name === 'AbortError') {
                // Request timed out
                showFallback('GitHub API timed out. Showing offline list below.');
            } else {
                console.error(error);
                showFallback('Could not load projects from GitHub. Showing offline list below.');
            }
        });
})();