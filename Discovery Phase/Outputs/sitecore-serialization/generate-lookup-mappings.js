#!/usr/bin/env node
/**
 * Generates lookup mapping tables for Craft CMS → Sitecore content migration.
 * Uses the same deterministic GUID function as generate-templates.js.
 *
 * Output: lookup-mappings.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function guid(seed) {
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32)
  ].join('-');
}

// ─── Color Themes ───
const COLOR_THEMES = ['light', 'medium', 'dark'];
const colorThemeMap = {};
COLOR_THEMES.forEach(name => {
  colorThemeMap[name] = guid(`color:${name}`);
});

// ─── Productline Themes ───
const PRODUCTLINE_THEMES = ['standard'];
const productlineThemeMap = {};
PRODUCTLINE_THEMES.forEach(name => {
  productlineThemeMap[name] = guid(`prod:${name}`);
});

// ─── Course Types ───
// Craft: courseData_collections_BlockType → "Course"
// Craft: courseData_compactTrainings_BlockType → "Compact Training"
const COURSE_TYPES = [
  { craftValue: 'courseData_collections_BlockType', name: 'Course' },
  { craftValue: 'courseData_compactTrainings_BlockType', name: 'Compact Training' },
];
const courseTypeMap = {};
COURSE_TYPES.forEach(ct => {
  courseTypeMap[ct.craftValue] = guid(`ct:${ct.name}`);
  courseTypeMap[ct.name] = guid(`ct:${ct.name}`);  // also map by display name
});

// ─── Main Categories ───
const CATEGORIES = [
  { slug: 'professional', title: 'PROFESSIONAL' },
  { slug: 'spa', title: 'SPA' },
  { slug: 'quickfix', title: 'QUICKFIX' },
  { slug: 'watersystems', title: 'WATERSYSTEMS' },
  { slug: 'brand', title: 'BRAND' },
  { slug: 'colours', title: 'COLOURS' },
  { slug: 'atrio', title: 'ATRIO' },
  { slug: 'allure', title: 'ALLURE' },
  { slug: 'everstream', title: 'EVERSTREAM' },
  { slug: 'purefoam', title: 'PUREFOAM' },
  { slug: 'rainshower-aqua-pure', title: 'RAINSHOWER AQUA PURE' },
  { slug: 'body-sprays', title: 'RAINSHOWER AQUA BODY SPRAYS' },
  { slug: 'rsh-aqua-ceiling-shower-element', title: 'RSH AQUA CEILING SHOWER ELEMENT' },
  { slug: 'cubeo', title: 'CUBEO' },
  { slug: 'ceramics', title: 'CERAMICS' },
  { slug: 'sensia-arena', title: 'SENSIA ARENA' },
  { slug: 'sensia-pro', title: 'SENSIA PRO' },
  { slug: 'smartcontrol', title: 'SMARTCONTROL' },
  { slug: 'tempesta-110', title: 'TEMPESTA 110' },
  { slug: 'rapido-smartbox', title: 'RAPIDO SMARTBOX' },
  { slug: 'installation-systems-2', title: 'INSTALLATION-SYSTEMS' },
  { slug: 'uniset', title: 'UNISET' },
  { slug: 'rapid-sl', title: 'RAPID SL' },
  { slug: 'euphoria', title: 'EUPHORIA' },
  { slug: 'grohtherm', title: 'GROHTHERM' },
  { slug: 'rapid-slx', title: 'RAPID SLX' },
  { slug: 'rapido-shower-frames', title: 'RAPIDO SHOWER FRAME' },
  { slug: 'bau-cosmopolitan-e', title: 'BAU COSMOPOLITAN E' },
  { slug: 'blue-pure', title: 'BLUE PURE' },
  { slug: 'essence-crafted-lever', title: 'ESSENCE CRAFTED LEVER' },
  { slug: 'vitalio-110', title: 'VITALIO 110' },
  { slug: 'quickglue', title: 'QUICKGLUE' },
  { slug: 'design', title: 'DESIGN' },
  { slug: 'features', title: 'FEATURES' },
  { slug: 'installation', title: 'INSTALLATION' },
  { slug: 'maintenance', title: 'MAINTENANCE' },
  { slug: 'sales', title: 'SALES' },
  { slug: 'grandera', title: 'GRANDERA' },
  { slug: 'ish-2025', title: 'ISH 2025' },
  { slug: 'allure-gravity', title: 'ALLURE GRAVITY' },
  { slug: 'salesforce', title: 'SALESFORCE' },
  { slug: 'plus', title: 'PLUS' },
  { slug: 'no-search', title: 'NO-SEARCH' },
  { slug: 'heat-recovery', title: 'HEAT RECOVERY' },
  { slug: 'aqua-tiles', title: 'AQUA TILES' },
  { slug: 'br1', title: 'BR1' },
  { slug: 'dice', title: 'Dice' },
  { slug: 'watersystems-2', title: 'Watersystems' },
];

const categoryMap = {};
CATEGORIES.forEach(cat => {
  categoryMap[cat.slug] = guid(`cat:${cat.slug}`);
});

// ─── Template IDs ───
const TEMPLATES_BASE = '/sitecore/templates/Project/Grohe Neo/Pages';
const templateIds = {
  collectionPage: guid(`template:${TEMPLATES_BASE}/GTC/Collection Page`),
  storyPage: guid(`template:${TEMPLATES_BASE}/GTC/Story Page`),
  quizPage: guid(`template:${TEMPLATES_BASE}/GTC/Quiz Page`),
};

// ─── Output ───
const mappings = {
  _description: 'Lookup mappings for Craft CMS → Sitecore AI content migration',
  _generated: new Date().toISOString(),

  templateIds,

  colorTheme: {
    _description: 'Craft colorTheme string → Sitecore GTC Color Theme item GUID',
    _usage: 'collection.colorTheme | training.colorTheme | quiz.colorTheme',
    mappings: colorThemeMap,
  },

  productlineTheme: {
    _description: 'Craft productlineTheme string → Sitecore GTC Productline Theme item GUID',
    _usage: 'collection.productlineTheme | training.productlineTheme | quiz.productlineTheme',
    mappings: productlineThemeMap,
  },

  courseType: {
    _description: 'Craft globalTracking __typename or display name → Sitecore GTC Course Type item GUID',
    _usage: 'globalTracking.courseData[].__typename → GUID',
    mappings: courseTypeMap,
  },

  mainCategories: {
    _description: 'Craft mainCategory slug → Sitecore GTC Category item GUID',
    _usage: 'taxonomy[0].mainCategories[].slug → GUID (pipe-separated for Multilist)',
    mappings: categoryMap,
  },
};

const outPath = path.join(__dirname, 'lookup-mappings.json');
fs.writeFileSync(outPath, JSON.stringify(mappings, null, 2), 'utf8');
console.log(`Written to ${outPath}`);
console.log(`\nColor Themes:      ${Object.keys(colorThemeMap).length} entries`);
console.log(`Productline Themes: ${Object.keys(productlineThemeMap).length} entries`);
console.log(`Course Types:       ${Object.keys(courseTypeMap).length} entries`);
console.log(`Main Categories:    ${Object.keys(categoryMap).length} entries`);

// Print a sample for verification
console.log('\n--- Sample mappings ---');
console.log(`  light → {${colorThemeMap['light'].toUpperCase()}}`);
console.log(`  standard → {${productlineThemeMap['standard'].toUpperCase()}}`);
console.log(`  Course → {${courseTypeMap['Course'].toUpperCase()}}`);
console.log(`  Compact Training → {${courseTypeMap['Compact Training'].toUpperCase()}}`);
console.log(`  professional → {${categoryMap['professional'].toUpperCase()}}`);
console.log(`  ceramics → {${categoryMap['ceramics'].toUpperCase()}}`);
