import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { pathToFileURL } from 'url';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'public', 'integrations', 'real');
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chromePath) {
  throw new Error('Chrome or Edge was not found. Install Chrome/Edge or update chromeCandidates in this script.');
}

fs.mkdirSync(outputDir, { recursive: true });

const dataModuleUrl = pathToFileURL(path.join(rootDir, 'src', 'data', 'integrations.js')).href;
const { INTEGRATIONS } = await import(dataModuleUrl + '?capture=' + Date.now());

const limitArgIndex = process.argv.indexOf('--limit');
const limit = limitArgIndex >= 0 ? Number(process.argv[limitArgIndex + 1]) : Infinity;
const refresh = process.argv.includes('--refresh');
const websiteOnly = process.argv.includes('--website-only');
const timeoutArgIndex = process.argv.indexOf('--timeout');
const captureTimeout = timeoutArgIndex >= 0 ? Number(process.argv[timeoutArgIndex + 1]) : 25000;
const onlyArgIndex = process.argv.indexOf('--only');
const onlySlugs = onlyArgIndex >= 0
  ? new Set(String(process.argv[onlyArgIndex + 1] || '').split(',').map((item) => item.trim()).filter(Boolean))
  : null;

function screenshotPath(slug, kind) {
  return path.join(outputDir, `${slug}-${kind}.png`);
}

function hasUsableRealImage(integration) {
  const kinds = ['website', 'docs', 'console', 'guide', 'pricing', 'repository', 'signup', 'login'];
  const extensions = ['png', 'jpg', 'jpeg', 'webp'];
  const hasCapturedFile = kinds.some((kind) => extensions.some((extension) => (
    fs.existsSync(path.join(rootDir, 'public', 'integrations', `${integration.slug}-${kind}.${extension}`))
    || fs.existsSync(path.join(outputDir, `${integration.slug}-${kind}.${extension}`))
  )));
  if (hasCapturedFile) return true;

  return (integration.images || []).some((image) => {
    if (!image?.src || image.src.includes('/manual-guides/') || image.src.endsWith('.svg')) return false;
    const rel = image.src.startsWith('/') ? image.src.slice(1) : image.src;
    return fs.existsSync(path.join(rootDir, 'public', rel));
  });
}

async function discoverLinks(baseUrl) {
  const result = {
    website: baseUrl,
  };

  try {
    const response = await fetch(baseUrl, {
      signal: AbortSignal.timeout(12000),
      headers: {
        'user-agent': 'Mozilla/5.0 real screenshot capture for integration documentation',
      },
    });
    const html = await response.text();
    const hrefs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis)]
      .map((match) => ({
        href: match[1],
        text: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(),
      }))
      .filter((item) => item.href && !item.href.startsWith('mailto:') && !item.href.startsWith('tel:'));

    const findLink = (patterns) => {
      const found = hrefs.find((item) => patterns.some((pattern) => pattern.test(`${item.text} ${item.href}`)));
      if (!found) return null;
      try {
        return new URL(found.href, baseUrl).toString();
      } catch {
        return null;
      }
    };

    result.docs = findLink([/docs?/, /documentation/, /developer/, /guide/, /quickstart/]);
    result.pricing = findLink([/pricing/, /plans?/]);
    result.signup = findLink([/sign\s*up/, /signup/, /get\s*started/, /start\s*free/, /try\s*free/]);
    result.login = findLink([/log\s*in/, /login/, /sign\s*in/, /signin/]);
  } catch {
    return result;
  }

  return result;
}

function capture(url, destination) {
  return new Promise((resolve) => {
    const profileDir = path.join(rootDir, '.tmp-chrome-screenshot-profile');
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      `--user-data-dir=${profileDir}`,
      '--window-size=1440,1100',
      `--screenshot=${destination}`,
      url,
    ];

    const child = spawn(chromePath, args, { stdio: 'ignore' });
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      resolve(false);
    }, captureTimeout);

    child.on('exit', () => {
      clearTimeout(timeout);
      resolve(fs.existsSync(destination) && fs.statSync(destination).size > 10_000);
    });
  });
}

let captured = 0;
let skipped = 0;
let failed = 0;

for (const integration of INTEGRATIONS) {
  if (onlySlugs && !onlySlugs.has(integration.slug)) continue;
  if (captured >= limit) break;

  const alreadyHasReal = hasUsableRealImage(integration);
  if (alreadyHasReal && !refresh) {
    skipped += 1;
    continue;
  }

  const links = await discoverLinks(integration.website);
  const targets = websiteOnly ? [
    ['website', links.website],
  ] : [
    ['website', links.website],
    ['docs', links.docs],
    ['pricing', links.pricing],
    ['signup', links.signup || links.login],
  ].filter(([, url]) => Boolean(url));

  for (const [kind, url] of targets) {
    const destination = screenshotPath(integration.slug, kind);
    if (fs.existsSync(destination) && fs.statSync(destination).size > 10_000) continue;
    const ok = await capture(url, destination);
    if (ok) {
      captured += 1;
      console.log(`captured ${integration.slug} ${kind}: ${url}`);
    } else {
      failed += 1;
      console.warn(`failed ${integration.slug} ${kind}: ${url}`);
    }
  }
}

console.log(JSON.stringify({
  captured,
  skipped,
  failed,
  outputDir: path.relative(rootDir, outputDir),
}, null, 2));
