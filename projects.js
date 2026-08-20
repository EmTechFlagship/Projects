(() => {
    const container = document.getElementById('projects');
    if (!container) return;

    const username = 'EmTechFlagship';
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`;

    // Loading state
    container.innerHTML = '<p class="projects-status">Loading projects&hellip;</p>';

    fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } })
        .then((response) => {
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            return response.json();
        })
        .then((repos) => {
            if (!Array.isArray(repos) || repos.length === 0) {
                container.innerHTML = '<p class="projects-status">No projects found.</p>';
                return;
            }

            const fragment = document.createDocumentFragment();
            repos.forEach((repo, index) => {
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

                fragment.append(card);
            });
            container.replaceChildren(fragment);
        })
        .catch((error) => {
            container.innerHTML = '<p class="projects-status">Failed to load projects.</p>';
            console.error(error);
        });
})();