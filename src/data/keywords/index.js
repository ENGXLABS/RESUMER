/**
 * keywords/index.js — Registry of all available industry keyword libraries.
 *
 * Usage:
 *   import { getLibrary, getAllLibraries, LIBRARIES } from './index.js';
 *   const lib = await getLibrary('quality-engineering');
 */

export const LIBRARIES = [
  { id: 'quality-engineering',  label: 'Quality Engineering / SDET' },
  { id: 'software-engineering', label: 'Software Engineering' },
  { id: 'product-management',   label: 'Product Management / TPM' },
  { id: 'data-engineering',     label: 'Data Engineering' },
  { id: 'devops-sre',           label: 'DevOps / SRE' },
  { id: 'frontend-engineering', label: 'Frontend Engineering' },
  { id: 'backend-engineering',  label: 'Backend Engineering' },
  { id: 'ai-ml-engineering',    label: 'AI / ML Engineering' },
  { id: 'management-leadership',label: 'Engineering Management / Leadership' },
];

/**
 * Load a keyword library by ID.
 * Libraries are loaded lazily (fetched as JSON) to keep the initial bundle small.
 * @param {string} id - Library ID from LIBRARIES
 * @returns {Promise<object>} The keyword library object
 */
export async function getLibrary(id) {
  const res = await fetch(`./src/data/keywords/${id}.json`);
  if (!res.ok) throw new Error(`Keyword library "${id}" not found`);
  return res.json();
}

/**
 * Load all available keyword libraries at once.
 * Use sparingly — prefer getLibrary() for on-demand loading.
 * @returns {Promise<object[]>}
 */
export async function getAllLibraries() {
  return Promise.all(LIBRARIES.map(({ id }) => getLibrary(id)));
}

/**
 * Auto-detect the most likely industry from a job description text.
 * Returns the best-matching library ID.
 * @param {string} jdText
 * @returns {string} Library ID
 */
export function detectIndustry(jdText) {
  const text = jdText.toLowerCase();

  const signals = {
    'quality-engineering':  ['qa', 'qe', 'sdet', 'quality engineer', 'test automation', 'selenium', 'appium'],
    'software-engineering': ['software engineer', 'sde', 'full-stack', 'backend engineer', 'java developer'],
    'product-management':   ['product manager', 'product management', 'tpm', 'roadmap', 'go-to-market'],
    'data-engineering':     ['data engineer', 'data pipeline', 'spark', 'airflow', 'dbt', 'warehouse'],
    'devops-sre':           ['devops', 'sre', 'site reliability', 'infrastructure', 'terraform', 'kubernetes'],
    'frontend-engineering': ['frontend', 'react', 'vue', 'angular', 'ui engineer', 'web developer'],
    'backend-engineering':  ['backend', 'api engineer', 'server-side', 'microservices', 'node.js'],
    'ai-ml-engineering':    ['machine learning', 'ml engineer', 'data scientist', 'llm', 'ai engineer'],
    'management-leadership':['engineering manager', 'head of engineering', 'director', 'vp engineering'],
  };

  let best = 'software-engineering';
  let bestScore = 0;

  for (const [lib, keywords] of Object.entries(signals)) {
    const score = keywords.filter(kw => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = lib;
    }
  }

  return best;
}
