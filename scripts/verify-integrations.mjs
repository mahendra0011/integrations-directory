import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { getLocalImageQuality, isLocalPublicImage, isUsableLocalImage } from './image-quality.mjs';

const rootDir = process.cwd();
const dataModuleUrl = pathToFileURL(path.join(rootDir, 'src', 'data', 'integrations.js')).href;
const { INTEGRATIONS, FILTER_CATEGORIES, STATS } = await import(dataModuleUrl + '?verify=' + Date.now());

const errors = [];
const warnings = [];
const passLabel = process.argv[2] || 'pass';

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function hasHindi(value) {
  return /[\u0900-\u097F]/.test(String(value));
}

function hasGeneratedFiller(value) {
  return /\b(lorem|todo|coming soon|dummy text|placeholder paragraph|sample provider only)\b/i.test(String(value));
}

function checkEnglishText(label, value) {
  const text = String(value || '');
  if (!text.trim()) fail(`${label}: text is empty`);
  if (hasHindi(text)) fail(`${label}: contains Hindi/Devanagari characters`);
  if (hasGeneratedFiller(text)) fail(`${label}: contains filler text`);
}

function imageExists(src) {
  if (!src || typeof src !== 'string') return false;
  if (/^https?:\/\//.test(src)) return true;
  const rel = src.startsWith('/') ? src.slice(1) : src;
  return fs.existsSync(path.join(rootDir, 'public', rel));
}

function usesRemovedGeneratedSvg(src) {
  return /\.svg(?:$|\?)/i.test(String(src || ''))
    || String(src || '').includes('/integrations/generated/')
    || String(src || '').includes('/integrations/manual-guides/');
}

function collectImages(integration) {
  return [
    ...(integration.images || []),
    ...(integration.workflowSteps || []).map((step) => step.image).filter(Boolean),
    ...(integration.manualWork?.detailedSteps || []).map((step) => step.image).filter(Boolean),
  ];
}

if (INTEGRATIONS.length < 300 || INTEGRATIONS.length > 400) {
  fail(`Catalog size must be 300-400 integrations, found ${INTEGRATIONS.length}`);
}

const allFilter = FILTER_CATEGORIES.find((category) => category.key === 'all');
if (!allFilter || allFilter.count !== INTEGRATIONS.length) {
  fail(`All filter count mismatch: expected ${INTEGRATIONS.length}, found ${allFilter?.count}`);
}

const statsIntegrations = STATS.find((item) => item.label === 'Integrations');
if (!statsIntegrations || statsIntegrations.target !== INTEGRATIONS.length) {
  fail(`Stats integration target mismatch: expected ${INTEGRATIONS.length}, found ${statsIntegrations?.target}`);
}

const statsSetupSections = STATS.find((item) => item.label === 'Setup Sections');

const seenIds = new Set();
const seenSlugs = new Set();
const referencedLocalImageSrcs = new Set();

for (const integration of INTEGRATIONS) {
  for (const image of collectImages(integration)) {
    if (isLocalPublicImage(image.src)) {
      referencedLocalImageSrcs.add(image.src);
    }
  }
}

const imageQualityBySrc = getLocalImageQuality(rootDir, [...referencedLocalImageSrcs]);

for (const integration of INTEGRATIONS) {
  const label = `${integration.id}:${integration.slug}`;

  if (seenIds.has(integration.id)) fail(`${label}: duplicate id`);
  seenIds.add(integration.id);

  if (seenSlugs.has(integration.slug)) fail(`${label}: duplicate slug`);
  seenSlugs.add(integration.slug);

  checkEnglishText(`${label} name`, integration.name);
  checkEnglishText(`${label} sideHeading`, integration.sideHeading);
  checkEnglishText(`${label} desc`, integration.desc);
  checkEnglishText(`${label} explanation`, integration.explanation);

  if (!integration.website || !/^https?:\/\//.test(integration.website)) {
    fail(`${label}: missing official website URL`);
  }

  if (!Array.isArray(integration.tags) || integration.tags.length < 6) {
    fail(`${label}: expected at least 6 tags`);
  }

  if (!Array.isArray(integration.code) || integration.code.length < 25) {
    fail(`${label}: code block must contain at least 25 lines`);
  } else {
    const codeText = integration.code.join('\n');
    checkEnglishText(`${label} code`, codeText);
    if (!codeText.includes('express')) fail(`${label}: code block does not include Express server code`);
    if (!codeText.includes(integration.envExample?.[1]?.split('=')[0]?.split('_').slice(0, -1).join('_') || integration.slug.toUpperCase())) {
      warn(`${label}: code block may not reference its environment prefix clearly`);
    }
  }

  if (!Array.isArray(integration.envExample) || integration.envExample.length < 6) {
    fail(`${label}: envExample must include provider variables and base URLs`);
  }

  const steps = integration.workflowSteps || [];
  if (steps.length < 7 || steps.length > 12) {
    fail(`${label}: expected 7-12 topic-based setup sections, found ${steps.length}`);
  }

  if (!statsSetupSections || statsSetupSections.target !== steps.length) {
    fail(`${label}: setup section stat mismatch`);
  }

  for (const step of steps) {
    const stepLabel = `${label} step ${step.number}`;
    checkEnglishText(`${stepLabel} title`, step.title);
    checkEnglishText(`${stepLabel} description`, step.description);

    if (!step.image?.src) {
      fail(`${stepLabel}: missing image src`);
    } else if (usesRemovedGeneratedSvg(step.image.src)) {
      fail(`${stepLabel}: image still uses removed generated path: ${step.image.src}`);
    } else if (!imageExists(step.image.src)) {
      fail(`${stepLabel}: image file does not exist: ${step.image.src}`);
    }

    if (!step.pageHint || !step.buttonHint) {
      fail(`${stepLabel}: missing pageHint or buttonHint for manual navigation`);
    }

    if (!Array.isArray(step.image?.manualSteps) || step.image.manualSteps.length < 5) {
      fail(`${stepLabel}: image must include at least 5 text manual steps`);
    }

    for (const manualLine of step.image?.manualSteps || []) {
      checkEnglishText(`${stepLabel} image manual line`, manualLine);
    }
  }

  const manual = integration.manualWork;
  if (!manual) {
    fail(`${label}: manualWork missing`);
  } else {
    checkEnglishText(`${label} manual title`, manual.title);
    checkEnglishText(`${label} manual summary`, manual.summary);
    if (!/manual work required/i.test(manual.title + ' ' + manual.summary)) {
      fail(`${label}: manualWork must explicitly say Manual Work Required`);
    }
    if (!Array.isArray(manual.steps) || manual.steps.length < 7) {
      fail(`${label}: manualWork.steps must document at least 7 manual tasks`);
    }
    if (!Array.isArray(manual.warnings) || manual.warnings.length < 4) {
      fail(`${label}: manualWork.warnings must include at least 4 warnings`);
    }
    if (!Array.isArray(manual.checklist) || manual.checklist.length < 8) {
      fail(`${label}: manualWork.checklist must include at least 8 checks`);
    }
    if (!Array.isArray(manual.detailedSteps) || manual.detailedSteps.length !== steps.length) {
      fail(`${label}: manualWork.detailedSteps must mirror all setup sections`);
    }
  }

  if (!Array.isArray(integration.images) || integration.images.length < 1) {
    fail(`${label}: expected at least 1 real gallery image`);
  }

  for (const image of collectImages(integration)) {
    if (usesRemovedGeneratedSvg(image.src)) {
      fail(`${label}: image still uses removed generated path ${image.src}`);
    }
    if (!imageExists(image.src)) {
      fail(`${label}: missing image file ${image.src}`);
    }
    if (isLocalPublicImage(image.src) && !isUsableLocalImage(imageQualityBySrc.get(image.src))) {
      const quality = imageQualityBySrc.get(image.src);
      fail(`${label}: image appears blank, tiny, or low quality ${image.src} (${quality ? `${quality.width}x${quality.height}, colors=${quality.colors}, avg=${quality.avg}, size=${quality.size}` : 'not decoded'})`);
    }
    checkEnglishText(`${label} image alt/caption`, `${image.alt || ''} ${image.caption || ''}`);
    if (!Array.isArray(image.manualSteps) || image.manualSteps.length < 5) {
      fail(`${label}: image ${image.src} must include at least 5 text manual steps`);
    }
  }

  const lines = integration.detailLines || [];
  if (lines.length < 700) {
    fail(`${label}: expected 700+ detail lines, found ${lines.length}`);
  }

  const detailText = lines.join('\n');
  if (!detailText.includes('Manual Work Required')) {
    fail(`${label}: detailLines do not include Manual Work Required`);
  }
  if (detailText.includes('/integrations/generated/') || detailText.includes('/integrations/manual-guides/') || detailText.includes('.svg')) {
    fail(`${label}: detailLines still mention generated image assets`);
  }
  if (!detailText.includes('code')) {
    fail(`${label}: detailLines do not mention code work`);
  }
  if (!detailText.includes('Code flow')) {
    fail(`${label}: detailLines do not explain the code flow`);
  }
  if (!detailText.includes('real public screenshot')) {
    fail(`${label}: detailLines do not mention real public screenshots`);
  }

  lines.forEach((line, index) => {
    const lineLabel = `${label} detail line ${index + 1}`;
    checkEnglishText(lineLabel, line);
    if (!line.includes(integration.name)) {
      fail(`${lineLabel}: line does not mention integration name`);
    }
    if (line.length < 40) {
      fail(`${lineLabel}: line is too short for detailed guidance`);
    }
  });
}

const categoryCounts = INTEGRATIONS.reduce((acc, integration) => {
  acc[integration.cat] = (acc[integration.cat] || 0) + 1;
  return acc;
}, {});

for (const category of FILTER_CATEGORIES.filter((item) => item.key !== 'all')) {
  if (category.count !== categoryCounts[category.key]) {
    fail(`Category ${category.key} count mismatch: expected ${categoryCounts[category.key]}, found ${category.count}`);
  }
}

const totalDetailLines = INTEGRATIONS.reduce((total, integration) => total + integration.detailLines.length, 0);
const totalWorkflowImages = INTEGRATIONS.reduce((total, integration) => total + integration.workflowSteps.length, 0);
const totalRealImages = INTEGRATIONS.reduce((total, integration) => total + integration.images.length, 0);

if (errors.length) {
  console.error(`Integration verification ${passLabel} failed with ${errors.length} errors.`);
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- ...and ${errors.length - 80} more errors`);
  process.exit(1);
}

console.log(`Integration verification ${passLabel} passed.`);
console.log(JSON.stringify({
  integrations: INTEGRATIONS.length,
  categories: categoryCounts,
  detailLines: totalDetailLines,
  setupSections: totalWorkflowImages,
  realImages: totalRealImages,
  warnings: warnings.length,
}, null, 2));

if (warnings.length) {
  console.warn(`Warnings: ${warnings.length}`);
  for (const warning of warnings.slice(0, 20)) console.warn(`- ${warning}`);
}
