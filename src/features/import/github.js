/**
 * GitHub public repo import — fetches public repos and formats them
 * as markdown Projects section or profile project objects.
 * Pure helper functions are unit-testable; fetchRepos requires a network.
 */

export const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetch public repos for a GitHub user.
 * @param {string} username
 * @param {object} [opts]
 * @param {number} [opts.limit=8] - max repos to fetch
 * @param {string} [opts.sort='updated'] - 'updated' | 'created' | 'pushed' | 'full_name'
 * @returns {Promise<object[]>} array of GitHub repo objects
 */
export async function fetchRepos(username, { limit = 8, sort = 'updated' } = {}) {
    if (!username || typeof username !== 'string') {
        throw new TypeError('username must be a non-empty string');
    }
    const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos`
        + `?sort=${sort}&per_page=${limit}&type=public`;
    const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) {
        const msg = res.status === 404 ? `User '${username}' not found` : `GitHub API error ${res.status}`;
        throw new Error(msg);
    }
    return res.json();
}

/**
 * Convert a list of GitHub repo objects to a markdown Projects section.
 * Forks are skipped.
 * @param {object[]} repos
 * @returns {string} markdown string
 */
export function reposToMarkdown(repos) {
    if (!Array.isArray(repos) || repos.length === 0) return '';
    const lines = ['## Projects', ''];
    for (const repo of repos) {
        if (repo.fork) continue;
        const lang  = repo.language             ? ` \`${repo.language}\``          : '';
        const stars = repo.stargazers_count > 0 ? ` ⭐ ${repo.stargazers_count}`  : '';
        lines.push(`### [${repo.name}](${repo.html_url})${lang}${stars}`);
        if (repo.description) lines.push(`- ${repo.description}`);
        if (repo.topics?.length) lines.push(`- Topics: ${repo.topics.join(', ')}`);
        lines.push('');
    }
    return lines.join('\n');
}

/**
 * Convert a list of GitHub repo objects to resumer profile project entries.
 * Forks are skipped.
 * @param {object[]} repos
 * @returns {object[]} array of project objects compatible with profile.json schema
 */
export function reposToProfileProjects(repos) {
    if (!Array.isArray(repos)) return [];
    return repos
        .filter(r => !r.fork)
        .map(r => ({
            name:        r.name || '',
            description: r.description || '',
            url:         r.html_url || '',
            keywords:    [r.language, ...(r.topics || [])].filter(Boolean),
        }));
}
