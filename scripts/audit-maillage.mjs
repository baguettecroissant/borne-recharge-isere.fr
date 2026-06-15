/**
 * Internal Linking Audit Script
 * Analyzes the quality of internal link structure across all pages
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const communes = JSON.parse(readFileSync(resolve(__dirname, '../src/data/communes.json'), 'utf-8'));

console.log('========================================================');
console.log('   INTERNAL LINKING AUDIT');
console.log('========================================================\n');

// 1. Check page structure
const pages = readdirSync(resolve(__dirname, '../src/pages'));
const guides = readdirSync(resolve(__dirname, '../src/content/guides'));

console.log('--- 1. PAGES INVENTORY ---\n');
console.log(`  Static pages: ${pages.filter(p => p.endsWith('.astro') && !p.includes('[')).length}`);
pages.filter(p => p.endsWith('.astro') && !p.includes('[')).forEach(p => console.log(`    - ${p}`));
console.log(`  Dynamic templates: ${pages.filter(p => p.includes('[')).length}`);
pages.filter(p => p.includes('[')).forEach(p => console.log(`    - ${p} → ${communes.length} pages`));
console.log(`  Guide articles: ${guides.length}`);
guides.forEach(g => console.log(`    - ${g}`));

const totalPages = pages.filter(p => p.endsWith('.astro') && !p.includes('[')).length 
  + pages.filter(p => p.includes('[')).length * communes.length 
  + guides.length;
console.log(`\n  TOTAL PAGES: ${totalPages}\n`);

// 2. Check internal link types per template
console.log('--- 2. LINK TYPES PER TEMPLATE ---\n');

function analyzeTemplate(filename) {
  const content = readFileSync(resolve(__dirname, `../src/pages/${filename}`), 'utf-8');
  
  const linkTypes = {
    sameTemplateNeighbors: 0,
    crossTemplateLinks: 0,
    guideLinks: 0,
    staticPageLinks: 0,
    externalLinks: 0,
    anchorLinks: 0
  };
  
  // Count link patterns
  const hrefMatches = content.match(/href=["{`]/g) || [];
  linkTypes.sameTemplateNeighbors = (content.match(/nearby\.map|nearby\b/g) || []).length;
  linkTypes.crossTemplateLinks = (content.match(/installateur-borne-recharge-|borne-recharge-copropriete-|wallbox-/g) || []).length;
  linkTypes.guideLinks = (content.match(/\/guides\//g) || []).length;
  linkTypes.staticPageLinks = (content.match(/href=["'`]\/(?:tarifs|aides-advenir|guide-installation|communes|devis|recharge-montagne)/g) || []).length;
  linkTypes.externalLinks = (content.match(/target=["']_blank["']/g) || []).length;
  linkTypes.anchorLinks = (content.match(/href=["']#/g) || []).length;
  
  return linkTypes;
}

const templates = [
  'installateur-borne-recharge-[commune].astro',
  'borne-recharge-copropriete-[commune].astro',
  'wallbox-[commune].astro'
];

for (const t of templates) {
  const links = analyzeTemplate(t);
  const total = Object.values(links).reduce((a, b) => a + b, 0);
  console.log(`  📄 ${t}:`);
  console.log(`    Same-template neighbors: ${links.sameTemplateNeighbors > 0 ? '✅' : '❌'} (${links.sameTemplateNeighbors} references)`);
  console.log(`    Cross-template links: ${links.crossTemplateLinks > 0 ? '✅' : '❌'} (${links.crossTemplateLinks} refs)`);
  console.log(`    Guide article links: ${links.guideLinks > 0 ? '✅' : '❌'} (${links.guideLinks} refs)`);
  console.log(`    Static page links: ${links.staticPageLinks} refs`);
  console.log(`    External links: ${links.externalLinks} refs`);
  console.log(`    Total href patterns: ${total}`);
  console.log('');
}

// 3. Check static pages for internal links
console.log('--- 3. STATIC PAGE LINKING ---\n');

const staticPages = pages.filter(p => p.endsWith('.astro') && !p.includes('['));
for (const page of staticPages) {
  const content = readFileSync(resolve(__dirname, `../src/pages/${page}`), 'utf-8');
  const localPageLinks = (content.match(/installateur-borne-recharge-|borne-recharge-copropriete-|wallbox-/g) || []).length;
  const guideLinks = (content.match(/\/guides\//g) || []).length;
  const staticLinks = (content.match(/href=["'`]\/(?:tarifs|aides-advenir|guide-installation|communes|devis)/g) || []).length;
  
  const score = localPageLinks > 0 ? '✅' : (page === 'confirmation.astro' || page === 'mentions-legales.astro' || page === 'politique-confidentialite.astro' ? '⬜' : '⚠️');
  console.log(`  ${score} ${page.padEnd(40)} → Local: ${localPageLinks}, Guides: ${guideLinks}, Static: ${staticLinks}`);
}

// 4. Check guide articles for internal links
console.log('\n--- 4. GUIDE ARTICLE LINKING ---\n');

for (const guide of guides) {
  const content = readFileSync(resolve(__dirname, `../src/content/guides/${guide}`), 'utf-8');
  const localPageLinks = (content.match(/installateur-borne-recharge-|borne-recharge-copropriete-|wallbox-/g) || []).length;
  const otherGuideLinks = (content.match(/\/guides\//g) || []).length;
  const staticLinks = (content.match(/\/tarifs\/|\/aides-advenir\/|\/guide-installation\/|\/communes\/|\/devis\//g) || []).length;
  
  const score = localPageLinks > 0 ? '✅' : '⚠️';
  console.log(`  ${score} ${guide.padEnd(55)} → Local: ${localPageLinks}, Other guides: ${otherGuideLinks}, Static: ${staticLinks}`);
}

// 5. Link quality analysis
console.log('\n--- 5. MAILLAGE INTERNAL SCORING ---\n');

let maillageScore = 100;
const maillageIssues = [];
const maillageWins = [];

// Check footer linking
const layoutContent = readFileSync(resolve(__dirname, '../src/layouts/Layout.astro'), 'utf-8');
const footerLocalLinks = (layoutContent.match(/installateur-borne-recharge-|borne-recharge-copropriete-|wallbox-/g) || []).length;
if (footerLocalLinks > 0) maillageWins.push(`Footer links to ${footerLocalLinks / 3} communes × 3 templates`);
else { maillageScore -= 10; maillageIssues.push('Footer has no local commune links'); }

// Check cross-template linking
for (const t of templates) {
  const links = analyzeTemplate(t);
  if (links.crossTemplateLinks < 2) {
    maillageScore -= 5;
    maillageIssues.push(`${t}: insufficient cross-template linking (${links.crossTemplateLinks} refs)`);
  } else {
    maillageWins.push(`${t}: ${links.crossTemplateLinks} cross-template links`);
  }
  
  if (links.guideLinks < 2) {
    maillageScore -= 3;
    maillageIssues.push(`${t}: insufficient guide article links (${links.guideLinks})`);
  } else {
    maillageWins.push(`${t}: ${links.guideLinks} guide links`);
  }
}

// Check if index links to communes
const indexContent = readFileSync(resolve(__dirname, '../src/pages/index.astro'), 'utf-8');
const indexLocalLinks = (indexContent.match(/installateur-borne-recharge-/g) || []).length;
if (indexLocalLinks > 5) maillageWins.push(`Homepage links to ${indexLocalLinks} commune pages`);
else { maillageScore -= 10; maillageIssues.push(`Homepage only links to ${indexLocalLinks} communes`); }

// Check if guides link to local pages
let guidesWithLocalLinks = 0;
for (const guide of guides) {
  const content = readFileSync(resolve(__dirname, `../src/content/guides/${guide}`), 'utf-8');
  if ((content.match(/installateur-borne-recharge-|borne-recharge-copropriete-|wallbox-/g) || []).length > 0) {
    guidesWithLocalLinks++;
  }
}
if (guidesWithLocalLinks < guides.length / 2) {
  maillageScore -= 10;
  maillageIssues.push(`Only ${guidesWithLocalLinks}/${guides.length} guide articles link to local commune pages`);
}

console.log(`  MAILLAGE SCORE: ${maillageScore}/100\n`);

if (maillageWins.length > 0) {
  console.log('  ✅ Wins:');
  for (const w of maillageWins) console.log(`    ✅ ${w}`);
}
if (maillageIssues.length > 0) {
  console.log('\n  ❌ Issues:');
  for (const i of maillageIssues) console.log(`    ❌ ${i}`);
}
console.log('');
