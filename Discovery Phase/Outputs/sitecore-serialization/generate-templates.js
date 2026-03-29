#!/usr/bin/env node
/**
 * GTC Template YML Generator
 * Generates Sitecore Content Serialization (SCS) YML files for GTC page templates.
 * Follows the exact format used in grohe-neo-sitecore-xm-cloud.
 *
 * Run: node generate-templates.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Well-known Sitecore template IDs ───
const TEMPLATE_TEMPLATE   = 'ab86861a-6030-46c5-b394-e8f99e8b87db';
const SECTION_TEMPLATE    = 'e269fbb5-3750-427a-9149-7aa950b49301';
const FIELD_TEMPLATE      = '455a3e98-a627-4b40-8035-e683a0331ac7';
const FOLDER_TEMPLATE     = 'a87a00b1-e6db-45ab-8b54-636fec3b5523';

// ─── Well-known field IDs (system fields on template items) ───
const FIELD_TYPE          = 'ab162cc0-dc80-4abf-8871-998ee5d7ba32';
const FIELD_SOURCE        = '1eb8ae32-e190-44a6-968d-ed904c794ebf';
const FIELD_SHARED_FALLBACK = '24cb32f0-e364-4f37-b400-0f2899097b5b';
const FIELD_SHARED        = 'be351a73-fcb0-4213-93fa-c302d8ab4f51';
const FIELD_UNVERSIONED   = '39847666-389d-409b-95bd-f2016f11eed5';
const FIELD_SORTORDER     = 'ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e';
const FIELD_BASE_TEMPLATE = '12c33f3f-86c5-43a5-aeb4-5598cec45116';
const FIELD_ICON          = '06d5295c-ed2f-4a54-9bf2-26228d113318';
const FIELD_STD_VALUES    = 'f7d48a55-2158-4f02-9356-756654404f73';
const FIELD_SHARED_REV    = 'dbbbeca1-21c7-4906-9dd2-493c1efa59a2';
const FIELD_TITLE         = '19a69332-a23e-4e70-8d16-b2640cb24cc8';
const FIELD_SHORT_DESC    = '9541e67d-ce8c-4225-803d-33f7f29f09ef';

const FIELD_MASTERS       = '1172f251-dad4-4efb-a329-0c63500e4f1e';

// ─── Version/audit field IDs ───
const FIELD_CREATED       = '25bed78c-4957-4165-998a-ca1b52f67497';
const FIELD_OWNER         = '52807595-0f8f-4b20-8d2a-cb71d28c6103';
const FIELD_CREATED_BY    = '5dd74568-4d4b-44c1-b513-0af5f4cda34f';
const FIELD_REVISION      = '8cdc337e-a112-42fb-bbb4-4143751e123f';
const FIELD_UPDATED_BY    = 'badd9cf9-53e0-4d0c-bcc0-2d784c282f6a';
const FIELD_UPDATED       = 'd9cf14b1-fa16-4ba6-9288-e8a174d4d522';
const FIELD_UNVER_REV     = '30e85e5d-e00a-4864-b358-7624d511deb4';

// ─── NEO base template GUIDs (from General Page) ───
const BASE_PAGE_TEMPLATE   = '5b80f927-ada7-464a-97a6-a6e226d1cd96';
const ITAGGABLE_TEMPLATE   = '00a4a340-f77e-4e4e-996d-67209190cfb1';
const IPAGE_ASSET_MEDIA    = 'bf083033-d465-4447-9ebd-1410bb09a788';
const IINDEXABLE_TEMPLATE  = '46fd8c16-6eb3-4e27-a3bb-24d5a12a3a00';

// ─── Parent IDs ───
const PAGES_FOLDER_ID      = '210f336b-151b-4e03-adf2-3ae1646e1ad5';

// ─── Timestamp ───
const NOW = '20260328T120000Z';
const AUTHOR = 'sitecore\\artsiom.dylevich@actumdigital.com';

// ─── GUID generation (deterministic from path for reproducibility) ───
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

// ─── YML builders ───

function versionFields() {
  return [
    { id: FIELD_CREATED, hint: '__Created', value: NOW },
    { id: FIELD_OWNER, hint: '__Owner', value: AUTHOR, multiline: true },
    { id: FIELD_CREATED_BY, hint: '__Created by', value: AUTHOR, multiline: true },
    { id: FIELD_REVISION, hint: '__Revision', value: guid('rev-' + Math.random()) },
    { id: FIELD_UPDATED_BY, hint: '__Updated by', value: AUTHOR, multiline: true },
    { id: FIELD_UPDATED, hint: '__Updated', value: NOW },
  ];
}

function renderField(f, indent = '') {
  let s = `${indent}- ID: "${f.id}"\n`;
  s += `${indent}  Hint: ${f.hint}\n`;
  if (f.multiline) {
    const lines = f.value.split('\n').map(l => `${indent}    ${l}`).join('\n');
    s += `${indent}  Value: |\n${lines}\n`;
  } else {
    s += `${indent}  Value: ${f.value}\n`;
  }
  return s;
}

function renderFields(fields, indent = '') {
  return fields.map(f => renderField(f, indent)).join('');
}

function templateYml({ id, parent, template, path: itemPath, sharedFields, langFields }) {
  let yml = '---\n';
  yml += `ID: "${id}"\n`;
  yml += `Parent: "${parent}"\n`;
  yml += `Template: "${template}"\n`;
  yml += `Path: ${itemPath}\n`;
  if (sharedFields && sharedFields.length > 0) {
    yml += 'SharedFields:\n';
    yml += renderFields(sharedFields);
  }
  yml += 'Languages:\n';
  yml += '- Language: en\n';
  if (langFields && langFields.length > 0) {
    yml += '  Fields:\n';
    yml += renderFields(langFields, '  ');
  }
  yml += '  Versions:\n';
  yml += '  - Version: 1\n';
  yml += '    Fields:\n';
  yml += renderFields(versionFields(), '    ');
  return yml;
}

// ─── Output directory ───
const OUT = path.join(__dirname, 'sitecore-templates');

function writeYml(relPath, content) {
  const fullPath = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('  ' + relPath);
}

// ─── Template definition helpers ───

function makeTemplateItem({ name, parentId, basePath, icon, baseTemplates, stdValuesId }) {
  const id = guid(`template:${basePath}/${name}`);
  const svId = stdValuesId || guid(`sv:${basePath}/${name}`);
  const sharedFields = [];
  if (icon) {
    sharedFields.push({ id: FIELD_ICON, hint: '__Icon', value: icon });
  }
  sharedFields.push({ id: FIELD_SHARED_REV, hint: '__Shared revision', value: `"${guid('srev:' + basePath + '/' + name)}"` });
  sharedFields.push({ id: FIELD_STD_VALUES, hint: '__Standard values', value: `"{${svId.toUpperCase()}}"` });
  if (baseTemplates.length === 1) {
    sharedFields.splice(1, 0, {
      id: FIELD_BASE_TEMPLATE, hint: '__Base template',
      value: `"{${baseTemplates[0].toUpperCase()}}"`,
    });
  } else if (baseTemplates.length > 1) {
    const btValue = baseTemplates.map(t => `{${t.toUpperCase()}}`).join('\n');
    sharedFields.splice(1, 0, {
      id: FIELD_BASE_TEMPLATE, hint: '__Base template',
      value: `|\n    ${btValue.split('\n').join('\n    ')}`,
    });
  }
  return { id, svId, sharedFields };
}

function makeSectionItem(name, parentId, basePath, sortOrder) {
  const id = guid(`section:${basePath}/${name}`);
  return {
    id,
    yml: templateYml({
      id,
      parent: parentId,
      template: SECTION_TEMPLATE,
      path: `${basePath}/${name}`,
      sharedFields: [
        { id: FIELD_SORTORDER, hint: '__Sortorder', value: String(sortOrder) },
        { id: FIELD_SHARED_REV, hint: '__Shared revision', value: `"${guid('srev:section:' + basePath + '/' + name)}"` },
      ],
    }),
  };
}

function makeFieldItem(name, parentId, basePath, sortOrder, fieldType, opts = {}) {
  const id = guid(`field:${basePath}/${name}`);
  const sharedFields = [];

  if (opts.source) {
    sharedFields.push({ id: FIELD_SOURCE, hint: 'Source', value: `"${opts.source}"` });
  }

  // Shared language fallback — enabled for all fields
  sharedFields.push({ id: FIELD_SHARED_FALLBACK, hint: 'Enable Shared Language Fallback', value: '1' });

  // If field is Shared (same across all languages)
  if (opts.shared) {
    sharedFields.push({ id: FIELD_SHARED, hint: 'Shared', value: '1' });
  }

  sharedFields.push({ id: FIELD_TYPE, hint: 'Type', value: `"${fieldType}"` });
  sharedFields.push({ id: FIELD_SORTORDER, hint: '__Sortorder', value: String(sortOrder) });
  sharedFields.push({ id: FIELD_SHARED_REV, hint: '__Shared revision', value: `"${guid('srev:field:' + basePath + '/' + name)}"` });

  const langFields = [];
  if (opts.title) {
    langFields.push({ id: FIELD_TITLE, hint: 'Title', value: opts.title });
  }
  if (opts.shortDesc) {
    langFields.push({ id: FIELD_SHORT_DESC, hint: '__Short description', value: opts.shortDesc });
  }
  langFields.push({ id: FIELD_UNVER_REV, hint: '__Unversioned revision', value: `"${guid('urev:field:' + basePath + '/' + name)}"` });

  return {
    id,
    yml: templateYml({
      id,
      parent: parentId,
      template: FIELD_TEMPLATE,
      path: `${basePath}/${name}`,
      sharedFields,
      langFields,
    }),
  };
}

function makeStandardValues(templateId, templatePath, fields = []) {
  const svId = guid(`sv:${templatePath}`);
  let yml = '---\n';
  yml += `ID: "${svId}"\n`;
  yml += `Parent: "${templateId}"\n`;
  yml += `Template: "${templateId}"\n`;
  yml += `Path: ${templatePath}/__Standard Values\n`;
  if (fields.length > 0) {
    yml += 'SharedFields:\n';
    yml += renderFields(fields);
  }
  yml += 'Languages:\n';
  yml += '- Language: en\n';
  yml += '  Versions:\n';
  yml += '  - Version: 1\n';
  yml += '    Fields:\n';
  yml += renderFields(versionFields(), '    ');
  return { id: svId, yml };
}

// ═══════════════════════════════════════════════════════════════
//  GENERATE
// ═══════════════════════════════════════════════════════════════

console.log('Generating GTC template YML files...\n');

const TEMPLATES_BASE = '/sitecore/templates/Project/Grohe Neo/Pages';

// SCS convention: item "Foo" with children →
//   parent/Foo.yml       (the item itself)
//   parent/Foo/           (folder containing children)
// The item YML sits NEXT TO its children folder, not inside it.

// ─── 1. GTC Folder (under Pages) ───
const gtcFolderId = guid('folder:GTC');
writeYml('GTC.yml', templateYml({
  id: gtcFolderId,
  parent: PAGES_FOLDER_ID,
  template: FOLDER_TEMPLATE,
  path: `${TEMPLATES_BASE}/GTC`,
  sharedFields: [
    { id: FIELD_SORTORDER, hint: '__Sortorder', value: '500' },
  ],
}));

// ─── 2. _GtcBasePageTemplate ───
const baseTplPath = `${TEMPLATES_BASE}/GTC/_GtcBasePageTemplate`;
const baseTpl = makeTemplateItem({
  name: '_GtcBasePageTemplate',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: '',
  baseTemplates: [], // Pure foundation — no page base templates (those go on the 3 page templates)
  stdValuesId: guid(`sv:${baseTplPath}`),
});
writeYml('GTC/_GtcBasePageTemplate.yml', templateYml({
  id: baseTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: baseTplPath,
  sharedFields: baseTpl.sharedFields,
}));

// _GtcBasePageTemplate → GTC Content section
const baseContentSec = makeSectionItem('GTC Content', baseTpl.id, baseTplPath, 100);
writeYml('GTC/_GtcBasePageTemplate/GTC Content.yml', baseContentSec.yml);

const baseOverline = makeFieldItem('Overline', baseContentSec.id, `${baseTplPath}/GTC Content`, 100, 'Single-Line Text', {
  shortDesc: 'Translatable text displayed above headline',
});
writeYml('GTC/_GtcBasePageTemplate/GTC Content/Overline.yml', baseOverline.yml);

const baseSubline = makeFieldItem('Subline', baseContentSec.id, `${baseTplPath}/GTC Content`, 200, 'Rich Text', {
  shortDesc: 'Translatable text displayed below headline',
});
writeYml('GTC/_GtcBasePageTemplate/GTC Content/Subline.yml', baseSubline.yml);

// _GtcBasePageTemplate → GTC Settings section
const baseSettingsSec = makeSectionItem('GTC Settings', baseTpl.id, baseTplPath, 200);
writeYml('GTC/_GtcBasePageTemplate/GTC Settings.yml', baseSettingsSec.yml);

const baseColorTheme = makeFieldItem('ColorTheme', baseSettingsSec.id, `${baseTplPath}/GTC Settings`, 100, 'Droplink', {
  shared: true,
  source: "query:$site/*[@@name='Data']/*[@@templatename='GTC Color Themes Folder']/*",
  shortDesc: 'Visual theme: light, medium, or dark',
});
writeYml('GTC/_GtcBasePageTemplate/GTC Settings/ColorTheme.yml', baseColorTheme.yml);

const baseProdTheme = makeFieldItem('ProductlineTheme', baseSettingsSec.id, `${baseTplPath}/GTC Settings`, 200, 'Droplink', {
  shared: true,
  source: "query:$site/*[@@name='Data']/*[@@templatename='GTC Productline Themes Folder']/*",
  shortDesc: 'Product line brand variant',
});
writeYml('GTC/_GtcBasePageTemplate/GTC Settings/ProductlineTheme.yml', baseProdTheme.yml);

// _GtcBasePageTemplate → __Standard Values
const baseSv = makeStandardValues(baseTpl.id, baseTplPath);
writeYml('GTC/_GtcBasePageTemplate/__Standard Values.yml', baseSv.yml);


// ─── 2b. _GtcTaxonomyTemplate ───
const taxTplPath = `${TEMPLATES_BASE}/GTC/_GtcTaxonomyTemplate`;
const taxTpl = makeTemplateItem({
  name: '_GtcTaxonomyTemplate',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: '',
  baseTemplates: [],
  stdValuesId: guid(`sv:${taxTplPath}`),
});
writeYml('GTC/_GtcTaxonomyTemplate.yml', templateYml({
  id: taxTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: taxTplPath,
  sharedFields: taxTpl.sharedFields,
}));

const taxSec = makeSectionItem('GTC Taxonomy', taxTpl.id, taxTplPath, 100);
writeYml('GTC/_GtcTaxonomyTemplate/GTC Taxonomy.yml', taxSec.yml);

const taxMainCats = makeFieldItem('MainCategories', taxSec.id, `${taxTplPath}/GTC Taxonomy`, 100, 'Multilist', {
  shared: true,
  source: "query:$site/*[@@name='Data']/*[@@templateid='{0F77B4CF-AF0A-DE2F-B901-4F25A2BE3929}']/*",
  shortDesc: 'Product/topic categories (PROFESSIONAL, SPA, etc.)',
});
writeYml('GTC/_GtcTaxonomyTemplate/GTC Taxonomy/MainCategories.yml', taxMainCats.yml);

const taxSv = makeStandardValues(taxTpl.id, taxTplPath);
writeYml('GTC/_GtcTaxonomyTemplate/__Standard Values.yml', taxSv.yml);


// ─── 3. Collection Page ───
const collPath = `${TEMPLATES_BASE}/GTC/Collection Page`;
const collTpl = makeTemplateItem({
  name: 'Collection Page',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/colors.png',
  baseTemplates: [
    baseTpl.id,             // _GtcBasePageTemplate
    taxTpl.id,              // _GtcTaxonomyTemplate
    BASE_PAGE_TEMPLATE,     // _BasePageTemplate
    ITAGGABLE_TEMPLATE,     // ITaggableTemplate
    IPAGE_ASSET_MEDIA,      // IPageAssetMedia
    IINDEXABLE_TEMPLATE,    // IIndexableTemplate
  ],
  stdValuesId: guid(`sv:${collPath}`),
});
writeYml('GTC/Collection Page.yml', templateYml({
  id: collTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: collPath,
  sharedFields: collTpl.sharedFields,
}));

// Collection → GTC Content
const collContentSec = makeSectionItem('GTC Content', collTpl.id, collPath, 100);
writeYml('GTC/Collection Page/GTC Content.yml', collContentSec.yml);

const collHeroText = makeFieldItem('HeroText', collContentSec.id, `${collPath}/GTC Content`, 100, 'Rich Text', {
  shortDesc: 'Hero banner descriptive text',
});
writeYml('GTC/Collection Page/GTC Content/HeroText.yml', collHeroText.yml);

// Collection → GTC Settings
const collSettingsSec = makeSectionItem('GTC Settings', collTpl.id, collPath, 200);
writeYml('GTC/Collection Page/GTC Settings.yml', collSettingsSec.yml);

const collCourseType = makeFieldItem('CourseType', collSettingsSec.id, `${collPath}/GTC Settings`, 100, 'Droplink', {
  shared: true,
  source: "query:$site/*[@@name='Data']/*[@@templateid='{98FADA4A-8B8C-6948-F4E9-4278274514F0}']/*",
  shortDesc: 'Course or Compact Training — selects from Data/GTC Course Types',
});
writeYml('GTC/Collection Page/GTC Settings/CourseType.yml', collCourseType.yml);

const collIsHero = makeFieldItem('IsHero', collSettingsSec.id, `${collPath}/GTC Settings`, 200, 'Checkbox', {
  shared: true,
  shortDesc: 'Show hero stage layout',
});
writeYml('GTC/Collection Page/GTC Settings/IsHero.yml', collIsHero.yml);

// Collection → GTC Structure
const collStructSec = makeSectionItem('GTC Structure', collTpl.id, collPath, 300);
writeYml('GTC/Collection Page/GTC Structure.yml', collStructSec.yml);

const collChapters = makeFieldItem('Chapters', collStructSec.id, `${collPath}/GTC Structure`, 100, 'Multilist', {
  shared: true,
  source: 'query:.//*[@@templatename=\'Story Page\' or @@templatename=\'Quiz Page\']',
  shortDesc: 'Ordered list of Story + Quiz child pages',
});
writeYml('GTC/Collection Page/GTC Structure/Chapters.yml', collChapters.yml);

const collRequired = makeFieldItem('RequiredItems', collStructSec.id, `${collPath}/GTC Structure`, 200, 'Multilist', {
  shared: true,
  source: 'query:.//*[@@templatename=\'Story Page\' or @@templatename=\'Quiz Page\']',
  shortDesc: 'Stories/Quizzes required for course completion',
});
writeYml('GTC/Collection Page/GTC Structure/RequiredItems.yml', collRequired.yml);

// (Collection __Standard Values generated after Quiz Page — needs storyTpl + quizTpl IDs)


// ─── 4. Story Page ───
const storyPath = `${TEMPLATES_BASE}/GTC/Story Page`;
const storyTpl = makeTemplateItem({
  name: 'Story Page',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'Applications/32x32/text_rich_colored.png',
  baseTemplates: [
    baseTpl.id,
    taxTpl.id,              // _GtcTaxonomyTemplate
    BASE_PAGE_TEMPLATE,
    ITAGGABLE_TEMPLATE,
    IPAGE_ASSET_MEDIA,
    IINDEXABLE_TEMPLATE,
  ],
  stdValuesId: guid(`sv:${storyPath}`),
});
writeYml('GTC/Story Page.yml', templateYml({
  id: storyTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: storyPath,
  sharedFields: storyTpl.sharedFields,
}));

// Story → GTC Content
const storyContentSec = makeSectionItem('GTC Content', storyTpl.id, storyPath, 100);
writeYml('GTC/Story Page/GTC Content.yml', storyContentSec.yml);

const storyReadTime = makeFieldItem('ReadingTime', storyContentSec.id, `${storyPath}/GTC Content`, 100, 'Single-Line Text', {
  shared: true,
  shortDesc: 'e.g. "10 min" — not language-dependent',
});
writeYml('GTC/Story Page/GTC Content/ReadingTime.yml', storyReadTime.yml);

// Story → GTC Settings
const storySettingsSec = makeSectionItem('GTC Settings', storyTpl.id, storyPath, 200);
writeYml('GTC/Story Page/GTC Settings.yml', storySettingsSec.yml);

const storyActivity = makeFieldItem('TrainingActivity', storySettingsSec.id, `${storyPath}/GTC Settings`, 100, 'Single-Line Text', {
  shared: true,
  shortDesc: 'Tracking label for analytics',
});
writeYml('GTC/Story Page/GTC Settings/TrainingActivity.yml', storyActivity.yml);

// Story → __Standard Values
const storySv = makeStandardValues(storyTpl.id, storyPath);
writeYml('GTC/Story Page/__Standard Values.yml', storySv.yml);


// ─── 5. Quiz Page ───
const quizPath = `${TEMPLATES_BASE}/GTC/Quiz Page`;
const quizTpl = makeTemplateItem({
  name: 'Quiz Page',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'Apps/32x32/Question mark.png',
  baseTemplates: [
    baseTpl.id,
    BASE_PAGE_TEMPLATE,
    ITAGGABLE_TEMPLATE,
    IPAGE_ASSET_MEDIA,
    IINDEXABLE_TEMPLATE,
  ],
  stdValuesId: guid(`sv:${quizPath}`),
});
writeYml('GTC/Quiz Page.yml', templateYml({
  id: quizTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: quizPath,
  sharedFields: quizTpl.sharedFields,
}));

// Quiz → GTC Content
const quizContentSec = makeSectionItem('GTC Content', quizTpl.id, quizPath, 100);
writeYml('GTC/Quiz Page/GTC Content.yml', quizContentSec.yml);

const quizInstruction = makeFieldItem('InstructionText', quizContentSec.id, `${quizPath}/GTC Content`, 100, 'Rich Text', {
  shortDesc: 'Quiz intro/instructions',
});
writeYml('GTC/Quiz Page/GTC Content/InstructionText.yml', quizInstruction.yml);

// Quiz → GTC Quiz Configuration
const quizConfigSec = makeSectionItem('GTC Quiz Configuration', quizTpl.id, quizPath, 200);
writeYml('GTC/Quiz Page/GTC Quiz Configuration.yml', quizConfigSec.yml);

const quizPassScore = makeFieldItem('PassingScore', quizConfigSec.id, `${quizPath}/GTC Quiz Configuration`, 100, 'Integer', {
  shared: true,
  shortDesc: 'Percentage threshold (0-100)',
});
writeYml('GTC/Quiz Page/GTC Quiz Configuration/PassingScore.yml', quizPassScore.yml);

const quizNumQ = makeFieldItem('NumberOfQuestions', quizConfigSec.id, `${quizPath}/GTC Quiz Configuration`, 200, 'Integer', {
  shared: true,
  shortDesc: 'How many questions to show per attempt',
});
writeYml('GTC/Quiz Page/GTC Quiz Configuration/NumberOfQuestions.yml', quizNumQ.yml);

const quizShuffle = makeFieldItem('ShuffleQuestions', quizConfigSec.id, `${quizPath}/GTC Quiz Configuration`, 300, 'Checkbox', {
  shared: true,
  shortDesc: 'Randomize question order',
});
writeYml('GTC/Quiz Page/GTC Quiz Configuration/ShuffleQuestions.yml', quizShuffle.yml);

const quizFeedback = makeFieldItem('EnableFeedback', quizConfigSec.id, `${quizPath}/GTC Quiz Configuration`, 400, 'Checkbox', {
  shared: true,
  shortDesc: 'Show per-question feedback',
});
writeYml('GTC/Quiz Page/GTC Quiz Configuration/EnableFeedback.yml', quizFeedback.yml);

const quizActivity = makeFieldItem('TrainingActivity', quizConfigSec.id, `${quizPath}/GTC Quiz Configuration`, 500, 'Single-Line Text', {
  shared: true,
  shortDesc: 'Tracking label for analytics',
});
writeYml('GTC/Quiz Page/GTC Quiz Configuration/TrainingActivity.yml', quizActivity.yml);

// Quiz → GTC Quiz Feedback
const quizFbSec = makeSectionItem('GTC Quiz Feedback', quizTpl.id, quizPath, 300);
writeYml('GTC/Quiz Page/GTC Quiz Feedback.yml', quizFbSec.yml);

const quizPassHead = makeFieldItem('PassHeadline', quizFbSec.id, `${quizPath}/GTC Quiz Feedback`, 100, 'Single-Line Text', {
  shortDesc: 'Heading shown on pass',
});
writeYml('GTC/Quiz Page/GTC Quiz Feedback/PassHeadline.yml', quizPassHead.yml);

const quizPassText = makeFieldItem('PassText', quizFbSec.id, `${quizPath}/GTC Quiz Feedback`, 200, 'Rich Text', {
  shortDesc: 'Message shown on pass',
});
writeYml('GTC/Quiz Page/GTC Quiz Feedback/PassText.yml', quizPassText.yml);

const quizPassImg = makeFieldItem('PassImage', quizFbSec.id, `${quizPath}/GTC Quiz Feedback`, 300, 'Image', {
  shared: true,
  shortDesc: 'Image for pass screen',
});
writeYml('GTC/Quiz Page/GTC Quiz Feedback/PassImage.yml', quizPassImg.yml);

const quizFailHead = makeFieldItem('FailHeadline', quizFbSec.id, `${quizPath}/GTC Quiz Feedback`, 400, 'Single-Line Text', {
  shortDesc: 'Heading shown on fail',
});
writeYml('GTC/Quiz Page/GTC Quiz Feedback/FailHeadline.yml', quizFailHead.yml);

const quizFailText = makeFieldItem('FailText', quizFbSec.id, `${quizPath}/GTC Quiz Feedback`, 500, 'Rich Text', {
  shortDesc: 'Message shown on fail',
});
writeYml('GTC/Quiz Page/GTC Quiz Feedback/FailText.yml', quizFailText.yml);

const quizFailImg = makeFieldItem('FailImage', quizFbSec.id, `${quizPath}/GTC Quiz Feedback`, 600, 'Image', {
  shared: true,
  shortDesc: 'Image for fail screen',
});
writeYml('GTC/Quiz Page/GTC Quiz Feedback/FailImage.yml', quizFailImg.yml);

// Quiz → __Standard Values
const quizSv = makeStandardValues(quizTpl.id, quizPath, [
  { id: quizShuffle.id, hint: 'ShuffleQuestions', value: '1' },
  { id: quizFeedback.id, hint: 'EnableFeedback', value: '1' },
]);
writeYml('GTC/Quiz Page/__Standard Values.yml', quizSv.yml);

// ─── Collection Page __Standard Values (deferred — needs storyTpl + quizTpl IDs) ───
const collSv = makeStandardValues(collTpl.id, collPath, [
  { id: baseColorTheme.id, hint: 'ColorTheme', value: '{3F123C71-443C-1853-37D5-612B09777FF8}' },
  { id: collCourseType.id, hint: 'CourseType', value: '{BAC7E663-54A1-54E3-4EB8-357F238954D9}' },
  { id: baseProdTheme.id, hint: 'ProductlineTheme', value: '{E36CBD21-CA3F-9B6A-03E8-8D4188CA1341}' },
  { id: FIELD_MASTERS, hint: '__Masters', value: `{${storyTpl.id.toUpperCase()}}\n{${quizTpl.id.toUpperCase()}}`, multiline: true },
]);
writeYml('GTC/Collection Page/__Standard Values.yml', collSv.yml);


// ─── 6. Lookup Templates ───

// GTC Category template
const catTplPath = `${TEMPLATES_BASE}/GTC/GTC Category`;
const catTpl = makeTemplateItem({
  name: 'GTC Category',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/cube_green.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${catTplPath}`),
});
writeYml('GTC/GTC Category.yml', templateYml({
  id: catTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: catTplPath,
  sharedFields: catTpl.sharedFields,
}));

const catContentSec = makeSectionItem('GTC Category', catTpl.id, catTplPath, 100);
writeYml('GTC/GTC Category/GTC Category.yml', catContentSec.yml);

const catValue = makeFieldItem('Value', catContentSec.id, `${catTplPath}/GTC Category`, 100, 'Single-Line Text', {
  shortDesc: 'Display value (title) of this category',
});
writeYml('GTC/GTC Category/GTC Category/Value.yml', catValue.yml);

const catSv = makeStandardValues(catTpl.id, catTplPath);
writeYml('GTC/GTC Category/__Standard Values.yml', catSv.yml);

// GTC Course Type template
const ctTplPath = `${TEMPLATES_BASE}/GTC/GTC Course Type`;
const ctTpl = makeTemplateItem({
  name: 'GTC Course Type',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/cube_yellow.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${ctTplPath}`),
});
writeYml('GTC/GTC Course Type.yml', templateYml({
  id: ctTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: ctTplPath,
  sharedFields: ctTpl.sharedFields,
}));

const ctContentSec = makeSectionItem('GTC Course Type', ctTpl.id, ctTplPath, 100);
writeYml('GTC/GTC Course Type/GTC Course Type.yml', ctContentSec.yml);

const ctValue = makeFieldItem('Value', ctContentSec.id, `${ctTplPath}/GTC Course Type`, 100, 'Single-Line Text', {
  shortDesc: 'Display value (title) of this course type',
});
writeYml('GTC/GTC Course Type/GTC Course Type/Value.yml', ctValue.yml);

const ctSv = makeStandardValues(ctTpl.id, ctTplPath);
writeYml('GTC/GTC Course Type/__Standard Values.yml', ctSv.yml);

// GTC Categories Folder template
const catFolderTplPath = `${TEMPLATES_BASE}/GTC/GTC Categories Folder`;
const catFolderTpl = makeTemplateItem({
  name: 'GTC Categories Folder',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/cubes_green.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${catFolderTplPath}`),
});
writeYml('GTC/GTC Categories Folder.yml', templateYml({
  id: catFolderTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: catFolderTplPath,
  sharedFields: catFolderTpl.sharedFields,
}));
// Standard values with insert options
const catFolderSv = makeStandardValues(catFolderTpl.id, catFolderTplPath, [
  { id: FIELD_MASTERS, hint: '__Masters', value: `{${catTpl.id.toUpperCase()}}` },
]);
writeYml('GTC/GTC Categories Folder/__Standard Values.yml', catFolderSv.yml);

// GTC Course Types Folder template
const ctFolderTplPath = `${TEMPLATES_BASE}/GTC/GTC Course Types Folder`;
const ctFolderTpl = makeTemplateItem({
  name: 'GTC Course Types Folder',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/cubes.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${ctFolderTplPath}`),
});
writeYml('GTC/GTC Course Types Folder.yml', templateYml({
  id: ctFolderTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: ctFolderTplPath,
  sharedFields: ctFolderTpl.sharedFields,
}));
const ctFolderSv = makeStandardValues(ctFolderTpl.id, ctFolderTplPath, [
  { id: FIELD_MASTERS, hint: '__Masters', value: `{${ctTpl.id.toUpperCase()}}` },
]);
writeYml('GTC/GTC Course Types Folder/__Standard Values.yml', ctFolderSv.yml);


// GTC Color Theme template
const colorTplPath = `${TEMPLATES_BASE}/GTC/GTC Color Theme`;
const colorTpl = makeTemplateItem({
  name: 'GTC Color Theme',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/cube_blue.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${colorTplPath}`),
});
writeYml('GTC/GTC Color Theme.yml', templateYml({
  id: colorTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: colorTplPath,
  sharedFields: colorTpl.sharedFields,
}));
const colorContentSec = makeSectionItem('GTC Color Theme', colorTpl.id, colorTplPath, 100);
writeYml('GTC/GTC Color Theme/GTC Color Theme.yml', colorContentSec.yml);
const colorValue = makeFieldItem('Value', colorContentSec.id, `${colorTplPath}/GTC Color Theme`, 100, 'Single-Line Text', {
  shortDesc: 'Display value of this color theme',
});
writeYml('GTC/GTC Color Theme/GTC Color Theme/Value.yml', colorValue.yml);
const colorSv = makeStandardValues(colorTpl.id, colorTplPath);
writeYml('GTC/GTC Color Theme/__Standard Values.yml', colorSv.yml);

// GTC Color Themes Folder template
const colorFolderTplPath = `${TEMPLATES_BASE}/GTC/GTC Color Themes Folder`;
const colorFolderTpl = makeTemplateItem({
  name: 'GTC Color Themes Folder',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/cubes_blue.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${colorFolderTplPath}`),
});
writeYml('GTC/GTC Color Themes Folder.yml', templateYml({
  id: colorFolderTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: colorFolderTplPath,
  sharedFields: colorFolderTpl.sharedFields,
}));
const colorFolderSv = makeStandardValues(colorFolderTpl.id, colorFolderTplPath, [
  { id: FIELD_MASTERS, hint: '__Masters', value: `{${colorTpl.id.toUpperCase()}}` },
]);
writeYml('GTC/GTC Color Themes Folder/__Standard Values.yml', colorFolderSv.yml);

// GTC Productline Theme template
const prodTplPath = `${TEMPLATES_BASE}/GTC/GTC Productline Theme`;
const prodTpl = makeTemplateItem({
  name: 'GTC Productline Theme',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'Applications/32x32/bullet_ball_glass_yellow.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${prodTplPath}`),
});
writeYml('GTC/GTC Productline Theme.yml', templateYml({
  id: prodTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: prodTplPath,
  sharedFields: prodTpl.sharedFields,
}));
const prodContentSec = makeSectionItem('GTC Productline Theme', prodTpl.id, prodTplPath, 100);
writeYml('GTC/GTC Productline Theme/GTC Productline Theme.yml', prodContentSec.yml);
const prodValue = makeFieldItem('Value', prodContentSec.id, `${prodTplPath}/GTC Productline Theme`, 100, 'Single-Line Text', {
  shortDesc: 'Display value of this productline theme',
});
writeYml('GTC/GTC Productline Theme/GTC Productline Theme/Value.yml', prodValue.yml);
const prodSv = makeStandardValues(prodTpl.id, prodTplPath);
writeYml('GTC/GTC Productline Theme/__Standard Values.yml', prodSv.yml);

// GTC Productline Themes Folder template
const prodFolderTplPath = `${TEMPLATES_BASE}/GTC/GTC Productline Themes Folder`;
const prodFolderTpl = makeTemplateItem({
  name: 'GTC Productline Themes Folder',
  parentId: gtcFolderId,
  basePath: `${TEMPLATES_BASE}/GTC`,
  icon: 'People/32x32/box_closed.png',
  baseTemplates: [],
  stdValuesId: guid(`sv:${prodFolderTplPath}`),
});
writeYml('GTC/GTC Productline Themes Folder.yml', templateYml({
  id: prodFolderTpl.id,
  parent: gtcFolderId,
  template: TEMPLATE_TEMPLATE,
  path: prodFolderTplPath,
  sharedFields: prodFolderTpl.sharedFields,
}));
const prodFolderSv = makeStandardValues(prodFolderTpl.id, prodFolderTplPath, [
  { id: FIELD_MASTERS, hint: '__Masters', value: `{${prodTpl.id.toUpperCase()}}` },
]);
writeYml('GTC/GTC Productline Themes Folder/__Standard Values.yml', prodFolderSv.yml);


// ═══════════════════════════════════════════════════════════════
//  CONTENT ITEMS — Lookup data under /Data/
// ═══════════════════════════════════════════════════════════════

console.log('\nGenerating lookup content items...\n');

const DATA_BASE = '/sitecore/content/Grohe Neo/Neo Website/Data';
const DATA_FOLDER_ID = '29a76892-7c10-4894-903f-e31ac4bc0eba';
const CONTENT_OUT = path.join(__dirname, 'sitecore-content');

function writeContentYml(relPath, content) {
  const fullPath = path.join(CONTENT_OUT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('  ' + relPath);
}

function contentItemYml({ id, parent, template, itemPath, displayName }) {
  let yml = '---\n';
  yml += `ID: "${id}"\n`;
  yml += `Parent: "${parent}"\n`;
  yml += `Template: "${template}"\n`;
  yml += `Path: ${itemPath}\n`;
  yml += 'Languages:\n';
  yml += '- Language: en\n';
  yml += '  Versions:\n';
  yml += '  - Version: 1\n';
  yml += '    Fields:\n';
  if (displayName) {
    yml += renderField({ id: FIELD_TITLE, hint: '__Display name', value: displayName }, '    ');
  }
  yml += renderFields(versionFields(), '    ');
  return yml;
}

function contentItemWithValueYml({ id, parent, template, itemPath, displayName, valueFieldId, value }) {
  let yml = '---\n';
  yml += `ID: "${id}"\n`;
  yml += `Parent: "${parent}"\n`;
  yml += `Template: "${template}"\n`;
  yml += `Path: ${itemPath}\n`;
  yml += 'SharedFields:\n';
  yml += renderField({ id: valueFieldId, hint: 'Value', value: value }, '');
  yml += 'Languages:\n';
  yml += '- Language: en\n';
  yml += '  Versions:\n';
  yml += '  - Version: 1\n';
  yml += '    Fields:\n';
  if (displayName) {
    yml += renderField({ id: FIELD_TITLE, hint: '__Display name', value: displayName }, '    ');
  }
  yml += renderFields(versionFields(), '    ');
  return yml;
}

// ─── GTC Categories folder ───
const catsFolderId = guid('content:GTC Categories');
const catsFolderPath = `${DATA_BASE}/GTC Categories`;
writeContentYml('GTC Categories.yml', contentItemYml({
  id: catsFolderId,
  parent: DATA_FOLDER_ID,
  template: catFolderTpl.id,
  itemPath: catsFolderPath,
  displayName: 'GTC Categories',
}));

// ─── All 48 category items ───
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

CATEGORIES.forEach((cat, i) => {
  const itemId = guid(`cat:${cat.slug}`);
  const itemName = cat.slug;
  writeContentYml(`GTC Categories/${itemName}.yml`, contentItemWithValueYml({
    id: itemId,
    parent: catsFolderId,
    template: catTpl.id,
    itemPath: `${catsFolderPath}/${itemName}`,
    displayName: cat.title,
    valueFieldId: catValue.id,
    value: cat.title,
  }));
});

// ─── GTC Course Types folder ───
const ctFolderId = guid('content:GTC Course Types');
const ctFolderPath = `${DATA_BASE}/GTC Course Types`;
writeContentYml('GTC Course Types.yml', contentItemYml({
  id: ctFolderId,
  parent: DATA_FOLDER_ID,
  template: ctFolderTpl.id,
  itemPath: ctFolderPath,
  displayName: 'GTC Course Types',
}));

// ─── Course Type items ───
const COURSE_TYPES = [
  { name: 'Course', title: 'Course' },
  { name: 'Compact Training', title: 'Compact Training' },
];

COURSE_TYPES.forEach((ct) => {
  const itemId = guid(`ct:${ct.name}`);
  writeContentYml(`GTC Course Types/${ct.name}.yml`, contentItemWithValueYml({
    id: itemId,
    parent: ctFolderId,
    template: ctTpl.id,
    itemPath: `${ctFolderPath}/${ct.name}`,
    displayName: ct.title,
    valueFieldId: ctValue.id,
    value: ct.title,
  }));
});


// ─── GTC Color Themes folder ───
const colorsFolderId = guid('content:GTC Color Themes');
const colorsFolderPath = `${DATA_BASE}/GTC Color Themes`;
writeContentYml('GTC Color Themes.yml', contentItemYml({
  id: colorsFolderId,
  parent: DATA_FOLDER_ID,
  template: colorFolderTpl.id,
  itemPath: colorsFolderPath,
  displayName: 'GTC Color Themes',
}));

const COLOR_THEMES = [
  { name: 'light', title: 'light' },
  { name: 'medium', title: 'medium' },
  { name: 'dark', title: 'dark' },
];

COLOR_THEMES.forEach((theme) => {
  const itemId = guid(`color:${theme.name}`);
  writeContentYml(`GTC Color Themes/${theme.name}.yml`, contentItemWithValueYml({
    id: itemId,
    parent: colorsFolderId,
    template: colorTpl.id,
    itemPath: `${colorsFolderPath}/${theme.name}`,
    displayName: theme.title,
    valueFieldId: colorValue.id,
    value: theme.title,
  }));
});

// ─── GTC Productline Themes folder ───
const prodsFolderId = guid('content:GTC Productline Themes');
const prodsFolderPath = `${DATA_BASE}/GTC Productline Themes`;
writeContentYml('GTC Productline Themes.yml', contentItemYml({
  id: prodsFolderId,
  parent: DATA_FOLDER_ID,
  template: prodFolderTpl.id,
  itemPath: prodsFolderPath,
  displayName: 'GTC Productline Themes',
}));

const PRODUCTLINE_THEMES = [
  { name: 'standard', title: 'standard' },
];

PRODUCTLINE_THEMES.forEach((theme) => {
  const itemId = guid(`prod:${theme.name}`);
  writeContentYml(`GTC Productline Themes/${theme.name}.yml`, contentItemWithValueYml({
    id: itemId,
    parent: prodsFolderId,
    template: prodTpl.id,
    itemPath: `${prodsFolderPath}/${theme.name}`,
    displayName: theme.title,
    valueFieldId: prodValue.id,
    value: theme.title,
  }));
});


// ─── Summary ───
console.log('\n✓ Generation complete.');
console.log(`\nTemplate IDs:`);
console.log(`  _GtcBasePageTemplate:     ${baseTpl.id}`);
console.log(`  Collection Page:          ${collTpl.id}`);
console.log(`  Story Page:               ${storyTpl.id}`);
console.log(`  Quiz Page:                ${quizTpl.id}`);
console.log(`  GTC Category:             ${catTpl.id}`);
console.log(`  GTC Course Type:          ${ctTpl.id}`);
console.log(`  GTC Categories Folder:    ${catFolderTpl.id}`);
console.log(`  GTC Course Types Folder:  ${ctFolderTpl.id}`);
console.log(`  GTC Color Theme:          ${colorTpl.id}`);
console.log(`  GTC Color Themes Folder:  ${colorFolderTpl.id}`);
console.log(`  GTC Productline Theme:    ${prodTpl.id}`);
console.log(`  GTC Productline Themes F: ${prodFolderTpl.id}`);
