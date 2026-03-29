#!/usr/bin/env node
/**
 * GTC Content Migration — Collections, Stories, Quizzes
 * Fetches all content from Craft GraphQL and generates Sitecore SCS YML files.
 *
 * Run: node generate-content.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Config ───
const CRAFT_EXPORT_FILE = path.join(__dirname, 'craft-export.json');

const TRAINING_FOLDER_ID = 'eb490170-566c-4524-a835-68c00589b7ed';
const TRAINING_PATH = '/sitecore/content/Grohe Neo/Neo Website/Home/Training';

const LOOKUPS = require('./lookup-mappings.json');
const OUT = path.join(__dirname, 'sitecore-migration');

// ─── Well-known IDs ───
const FIELD_TITLE         = '19a69332-a23e-4e70-8d16-b2640cb24cc8';
const FIELD_CREATED       = '25bed78c-4957-4165-998a-ca1b52f67497';
const FIELD_OWNER         = '52807595-0f8f-4b20-8d2a-cb71d28c6103';
const FIELD_CREATED_BY    = '5dd74568-4d4b-44c1-b513-0af5f4cda34f';
const FIELD_REVISION      = '8cdc337e-a112-42fb-bbb4-4143751e123f';
const FIELD_UPDATED_BY    = 'badd9cf9-53e0-4d0c-bcc0-2d784c282f6a';
const FIELD_UPDATED       = 'd9cf14b1-fa16-4ba6-9288-e8a174d4d522';

const NOW = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z/, 'Z');
const AUTHOR = 'sitecore\\artsiom.dylevich@actumdigital.com';

// ─── Template field IDs (from generate-templates.js deterministic GUIDs) ───
function guid(seed) {
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  return [hash.slice(0,8), hash.slice(8,12), hash.slice(12,16), hash.slice(16,20), hash.slice(20,32)].join('-');
}

const TEMPLATES_BASE = '/sitecore/templates/Project/Grohe Neo/Pages';

// Template IDs
const COLLECTION_TEMPLATE = LOOKUPS.templateIds.collectionPage;
const STORY_TEMPLATE = LOOKUPS.templateIds.storyPage;
const QUIZ_TEMPLATE = LOOKUPS.templateIds.quizPage;

// Field IDs — computed same way as generator
function fieldId(templatePath, sectionName, fieldName) {
  return guid(`field:${templatePath}/${sectionName}/${fieldName}`);
}

// _GtcBasePageTemplate fields
const basePath = `${TEMPLATES_BASE}/GTC/_GtcBasePageTemplate`;
const FID_OVERLINE = fieldId(basePath, 'GTC Content', 'Overline');
const FID_SUBLINE = fieldId(basePath, 'GTC Content', 'Subline');
const FID_COLOR_THEME = fieldId(basePath, 'GTC Settings', 'ColorTheme');
const FID_PRODUCTLINE_THEME = fieldId(basePath, 'GTC Settings', 'ProductlineTheme');

// _GtcTaxonomyTemplate fields
const taxPath = `${TEMPLATES_BASE}/GTC/_GtcTaxonomyTemplate`;
const FID_MAIN_CATEGORIES = fieldId(taxPath, 'GTC Taxonomy', 'MainCategories');

// Collection Page fields
const collPath = `${TEMPLATES_BASE}/GTC/Collection Page`;
const FID_HERO_TEXT = fieldId(collPath, 'GTC Content', 'HeroText');
const FID_COURSE_TYPE = fieldId(collPath, 'GTC Settings', 'CourseType');
const FID_IS_HERO = fieldId(collPath, 'GTC Settings', 'IsHero');
const FID_CHAPTERS = fieldId(collPath, 'GTC Structure', 'Chapters');
const FID_REQUIRED_ITEMS = fieldId(collPath, 'GTC Structure', 'RequiredItems');

// Story Page fields
const storyPath = `${TEMPLATES_BASE}/GTC/Story Page`;
const FID_READING_TIME = fieldId(storyPath, 'GTC Content', 'ReadingTime');
const FID_STORY_TRAINING_ACTIVITY = fieldId(storyPath, 'GTC Settings', 'TrainingActivity');

// Quiz Page fields
const quizPath = `${TEMPLATES_BASE}/GTC/Quiz Page`;
const FID_INSTRUCTION_TEXT = fieldId(quizPath, 'GTC Content', 'InstructionText');
const FID_PASSING_SCORE = fieldId(quizPath, 'GTC Quiz Configuration', 'PassingScore');
const FID_NUM_QUESTIONS = fieldId(quizPath, 'GTC Quiz Configuration', 'NumberOfQuestions');
const FID_SHUFFLE = fieldId(quizPath, 'GTC Quiz Configuration', 'ShuffleQuestions');
const FID_ENABLE_FEEDBACK = fieldId(quizPath, 'GTC Quiz Configuration', 'EnableFeedback');
const FID_QUIZ_TRAINING_ACTIVITY = fieldId(quizPath, 'GTC Quiz Configuration', 'TrainingActivity');
const FID_PASS_HEADLINE = fieldId(quizPath, 'GTC Quiz Feedback', 'PassHeadline');
const FID_PASS_TEXT = fieldId(quizPath, 'GTC Quiz Feedback', 'PassText');
const FID_PASS_IMAGE = fieldId(quizPath, 'GTC Quiz Feedback', 'PassImage');
const FID_FAIL_HEADLINE = fieldId(quizPath, 'GTC Quiz Feedback', 'FailHeadline');
const FID_FAIL_TEXT = fieldId(quizPath, 'GTC Quiz Feedback', 'FailText');
const FID_FAIL_IMAGE = fieldId(quizPath, 'GTC Quiz Feedback', 'FailImage');

// Question template IDs (deterministic)
const CHOICE_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Choice Question`);
const CHOICE_ANS_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Choice Answer`);
const TF_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC True False Question`);
const SLIDER_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Value Slider Question`);
const DD_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Drag Drop Question`);
const DD_PAIR_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Drag Drop Pair`);
const FILL_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Fill Blank Question`);
const SORT_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Sortable Question`);
const SORT_ITEM_TEMPLATE = guid(`template:${TEMPLATES_BASE}/GTC/GTC Sortable Item`);

// _GtcQuestionBaseTemplate fields
const qBasePath = `${TEMPLATES_BASE}/GTC/_GtcQuestionBaseTemplate`;
const FID_Q_OVERLINE = fieldId(qBasePath, 'GTC Question', 'QuestionOverline');
const FID_Q_TEXT = fieldId(qBasePath, 'GTC Question', 'QuestionText');
const FID_Q_INSTRUCTION = fieldId(qBasePath, 'GTC Question', 'QuestionInstruction');
const FID_Q_POS_FB = fieldId(qBasePath, 'GTC Question Feedback', 'PositiveFeedbackText');
const FID_Q_NEG_FB = fieldId(qBasePath, 'GTC Question Feedback', 'NegativeFeedbackText');
const FID_Q_SOL_FB = fieldId(qBasePath, 'GTC Question Feedback', 'SolutionFeedbackText');

// Choice Question fields
const choicePath = `${TEMPLATES_BASE}/GTC/GTC Choice Question`;
const FID_FORCE_MULTI = fieldId(choicePath, 'GTC Choice Settings', 'ForceMultipleChoice');
const FID_CHOICE_NO_SHUFFLE = fieldId(choicePath, 'GTC Choice Settings', 'DisableShuffle');

// Choice Answer fields
const choiceAnsPath = `${TEMPLATES_BASE}/GTC/GTC Choice Answer`;
const FID_ANS_TEXT = fieldId(choiceAnsPath, 'GTC Choice Answer', 'AnswerText');
const FID_ANS_CORRECT = fieldId(choiceAnsPath, 'GTC Choice Answer', 'IsCorrect');

// True False Question fields
const tfQPath = `${TEMPLATES_BASE}/GTC/GTC True False Question`;
const FID_TF_TRUE_LABEL = fieldId(tfQPath, 'GTC True False Settings', 'TrueLabel');
const FID_TF_FALSE_LABEL = fieldId(tfQPath, 'GTC True False Settings', 'FalseLabel');
const FID_TF_CORRECT = fieldId(tfQPath, 'GTC True False Settings', 'CorrectAnswer');

// Value Slider Question fields
const sliderQPath = `${TEMPLATES_BASE}/GTC/GTC Value Slider Question`;
const FID_SL_MIN = fieldId(sliderQPath, 'GTC Slider Settings', 'MinValue');
const FID_SL_MAX = fieldId(sliderQPath, 'GTC Slider Settings', 'MaxValue');
const FID_SL_STEPS = fieldId(sliderQPath, 'GTC Slider Settings', 'Steps');
const FID_SL_INIT = fieldId(sliderQPath, 'GTC Slider Settings', 'InitialValue');
const FID_SL_CORRECT = fieldId(sliderQPath, 'GTC Slider Settings', 'CorrectValue');
const FID_SL_THRESHOLD = fieldId(sliderQPath, 'GTC Slider Settings', 'CorrectThreshold');
const FID_SL_MIN_LABEL = fieldId(sliderQPath, 'GTC Slider Settings', 'MinLabel');
const FID_SL_MAX_LABEL = fieldId(sliderQPath, 'GTC Slider Settings', 'MaxLabel');
const FID_SL_VAL_LABEL = fieldId(sliderQPath, 'GTC Slider Settings', 'ValueLabel');

// Drag Drop fields
const ddQPath = `${TEMPLATES_BASE}/GTC/GTC Drag Drop Question`;
const FID_DD_NO_SHUFFLE = fieldId(ddQPath, 'GTC Drag Drop Settings', 'DisableShuffle');
const ddPairPath = `${TEMPLATES_BASE}/GTC/GTC Drag Drop Pair`;
const FID_DD_DRAG_TEXT = fieldId(ddPairPath, 'GTC Drag Drop Pair', 'DragText');
const FID_DD_DROP_TEXT = fieldId(ddPairPath, 'GTC Drag Drop Pair', 'DropText');

// Fill Blank fields
const fbQPath = `${TEMPLATES_BASE}/GTC/GTC Fill Blank Question`;
const FID_FB_TEXT = fieldId(fbQPath, 'GTC Fill Blank Settings', 'BlankText');

// Sortable Item fields
const sortItemQPath = `${TEMPLATES_BASE}/GTC/GTC Sortable Item`;
const FID_SORT_ITEM_TEXT = fieldId(sortItemQPath, 'GTC Sortable Item', 'ItemText');

// Craft typename → Sitecore template ID mapping
const QUESTION_TYPE_MAP = {
  'interactionBuilder_choiceModule_BlockType': CHOICE_TEMPLATE,
  'interactionBuilder_trueFalseModule_BlockType': TF_TEMPLATE,
  'interactionBuilder_valueSliderModule_BlockType': SLIDER_TEMPLATE,
  'interactionBuilder_DragDropModule_BlockType': DD_TEMPLATE,
  'interactionBuilder_fillTheBlankModule_BlockType': FILL_TEMPLATE,
  'interactionBuilder_sortableRankingListModule_BlockType': SORT_TEMPLATE,
};

// ─── Helpers ───

function contentGuid(seed) {
  return guid(`content:migration:${seed}`);
}

function writeYml(relPath, content) {
  const fullPath = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

function renderField(id, hint, value, indent = '') {
  if (value === null || value === undefined || value === '') return '';
  const strVal = String(value);
  // Use multiline for HTML content or multi-line values
  if (strVal.includes('\n') || strVal.includes('<p>') || strVal.includes('<')) {
    const lines = strVal.split('\n').map(l => `${indent}    ${l}`).join('\n');
    return `${indent}- ID: "${id}"\n${indent}  Hint: ${hint}\n${indent}  Value: |\n${lines}\n`;
  }
  return `${indent}- ID: "${id}"\n${indent}  Hint: ${hint}\n${indent}  Value: ${strVal}\n`;
}

function renderGuidField(id, hint, guidValue, indent = '') {
  if (!guidValue) return '';
  return `${indent}- ID: "${id}"\n${indent}  Hint: ${hint}\n${indent}  Value: "{${guidValue.toUpperCase()}}"\n`;
}

function renderGuidListField(id, hint, guids, indent = '') {
  if (!guids || guids.length === 0) return '';
  if (guids.length === 1) {
    return `${indent}- ID: "${id}"\n${indent}  Hint: ${hint}\n${indent}  Value: "{${guids[0].toUpperCase()}}"\n`;
  }
  const lines = guids.map(g => `${indent}    {${g.toUpperCase()}}`).join('\n');
  return `${indent}- ID: "${id}"\n${indent}  Hint: ${hint}\n${indent}  Value: |\n${lines}\n`;
}

function versionBlock(indent = '') {
  return [
    renderField(FIELD_CREATED, '__Created', NOW, indent),
    `${indent}- ID: "${FIELD_OWNER}"\n${indent}  Hint: __Owner\n${indent}  Value: |\n${indent}    ${AUTHOR}\n`,
    `${indent}- ID: "${FIELD_CREATED_BY}"\n${indent}  Hint: __Created by\n${indent}  Value: |\n${indent}    ${AUTHOR}\n`,
    renderField(FIELD_REVISION, '__Revision', guid('rev:' + Math.random()), indent),
    `${indent}- ID: "${FIELD_UPDATED_BY}"\n${indent}  Hint: __Updated by\n${indent}  Value: |\n${indent}    ${AUTHOR}\n`,
    renderField(FIELD_UPDATED, '__Updated', NOW, indent),
  ].join('');
}

const FIELD_SORTORDER = 'ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e';

function buildItemYml({ id, parent, template, itemPath, sharedFields, versionedFields, displayName, sortOrder }) {
  let yml = '---\n';
  yml += `ID: "${id}"\n`;
  yml += `Parent: "${parent}"\n`;
  yml += `Template: "${template}"\n`;
  yml += `Path: ${itemPath}\n`;

  // Prepend __Sortorder to shared fields if provided
  const sortField = (sortOrder !== undefined) ? renderField(FIELD_SORTORDER, '__Sortorder', String(sortOrder)) : '';

  if (sharedFields || sortField) {
    yml += 'SharedFields:\n';
    yml += sortField;
    if (sharedFields) yml += sharedFields;
  }

  yml += 'Languages:\n';
  yml += '- Language: en\n';
  yml += '  Versions:\n';
  yml += '  - Version: 1\n';
  yml += '    Fields:\n';
  if (displayName) {
    yml += renderField(FIELD_TITLE, '__Display name', displayName, '    ');
  }
  if (versionedFields) {
    yml += versionedFields;
  }
  yml += versionBlock('    ');

  return yml;
}

// ─── Lookup resolvers ───

function resolveColorTheme(value) {
  return LOOKUPS.colorTheme.mappings[value] || null;
}

function resolveProductlineTheme(value) {
  return LOOKUPS.productlineTheme.mappings[value] || null;
}

function resolveCourseType(typename) {
  return LOOKUPS.courseType.mappings[typename] || null;
}

function resolveCategories(cats) {
  if (!cats || !cats.length) return [];
  return cats.map(c => LOOKUPS.mainCategories.mappings[c.slug]).filter(Boolean);
}

// ─── Main ───

async function main() {
  if (!fs.existsSync(CRAFT_EXPORT_FILE)) {
    console.error(`Error: ${CRAFT_EXPORT_FILE} not found.\nRun "node export-craft-data.js" first to fetch data from Craft CMS.`);
    process.exit(1);
  }

  console.log(`Reading from ${path.basename(CRAFT_EXPORT_FILE)}...\n`);
  const exportData = JSON.parse(fs.readFileSync(CRAFT_EXPORT_FILE, 'utf8'));
  console.log(`  Exported at: ${exportData._exportedAt}`);

  const collections = exportData.collections;
  const quizzes = exportData.quizzes;
  const allTrainings = exportData.trainings;
  const globalTracking = exportData.globalTracking;

  console.log(`  Collections: ${collections.length}`);
  console.log(`  Trainings:   ${allTrainings.length}`);
  console.log(`  Quizzes:     ${quizzes.length}`);

  // Build tracking map: collection slug → { courseType, requiredSlugs[] }
  const trackingMap = {};
  for (const item of globalTracking.courseData) {
    if (item.__typename === 'courseData_collections_BlockType' && item.collection?.[0]) {
      trackingMap[item.collection[0].slug] = {
        courseType: 'courseData_collections_BlockType',
        requiredSlugs: (item.stories || []).map(s => s.slug),
      };
    } else if (item.__typename === 'courseData_compactTrainings_BlockType' && item.compactTraining) {
      trackingMap[item.compactTraining.slug] = {
        courseType: 'courseData_compactTrainings_BlockType',
        requiredSlugs: [],
      };
    }
  }

  // Build quiz map: correspondingTraining slug → quiz
  const quizByCollection = {};
  for (const q of quizzes) {
    if (q.correspondingTraining?.[0]) {
      quizByCollection[q.correspondingTraining[0].slug] = q;
    }
  }

  // Build training map by slug
  const trainingBySlug = {};
  for (const t of allTrainings) {
    trainingBySlug[t.slug] = t;
  }

  // Also check for trainings that reference collections but aren't in globalTracking
  // (some trainings may have contentDependencies.overview pointing to a collection)
  const trainingsWithOverview = allTrainings.filter(t =>
    t.contentDependencies?.[0]?.overview?.length > 0
  );

  // Build interaction lookup by slug
  const interactions = exportData.interactions || [];
  const interactionBySlug = {};
  for (const i of interactions) {
    interactionBySlug[i.slug] = i;
  }
  console.log(`  Interactions: ${interactions.length}`);

  // ─── Content ID map: slug → sitecore GUID ───
  const contentIdMap = {};

  // Register all items
  for (const c of collections) {
    contentIdMap[c.slug] = contentGuid(c.slug);
  }
  for (const t of allTrainings) {
    contentIdMap[t.slug] = contentGuid(t.slug);
  }
  for (const q of quizzes) {
    contentIdMap[q.slug] = contentGuid(q.slug);
  }
  for (const i of interactions) {
    contentIdMap[i.slug] = contentGuid(i.slug);
  }

  // ─── Generate YML files ───
  console.log('\nGenerating YML files...\n');

  // Clean output
  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true });
  }

  let collCount = 0, storyCount = 0, quizCount = 0, questionCount = 0, answerCount = 0;

  for (const c of collections) {
    const collId = contentIdMap[c.slug];
    const collItemPath = `${TRAINING_PATH}/${c.slug}`;
    const tracking = trackingMap[c.slug] || { courseType: 'courseData_collections_BlockType', requiredSlugs: [] };

    // Determine chapter order from previousChapter/nextChapter chain
    // Filter out quiz slugs from the stories list (they appear in globalTracking but are quiz entries)
    const quizSlugs = new Set(quizzes.map(q => q.slug));
    const childSlugs = (tracking.requiredSlugs || []).filter(s => !quizSlugs.has(s));
    // Also include the quiz if it exists
    const quiz = quizByCollection[c.slug];

    // Build ordered chapters by following the chain
    const chainedOrder = buildChapterOrder(childSlugs, trainingBySlug, quiz);
    const chapterGuids = chainedOrder.map(slug => contentIdMap[slug]).filter(Boolean);

    // Required items (stories/quizzes needed for completion)
    const requiredGuids = tracking.requiredSlugs.map(slug => contentIdMap[slug]).filter(Boolean);

    // Category GUIDs
    const catGuids = resolveCategories(c.taxonomy?.[0]?.mainCategories);

    // Shared fields
    let shared = '';
    shared += renderGuidField(FID_COLOR_THEME, 'ColorTheme', resolveColorTheme(c.colorTheme));
    shared += renderGuidField(FID_PRODUCTLINE_THEME, 'ProductlineTheme', resolveProductlineTheme(c.productlineTheme));
    shared += renderGuidField(FID_COURSE_TYPE, 'CourseType', resolveCourseType(tracking.courseType));
    shared += renderField(FID_IS_HERO, 'IsHero', c.collectionData?.[0]?.isHero ? '1' : '');
    shared += renderGuidListField(FID_CHAPTERS, 'Chapters', chapterGuids);
    shared += renderGuidListField(FID_REQUIRED_ITEMS, 'RequiredItems', requiredGuids);
    shared += renderGuidListField(FID_MAIN_CATEGORIES, 'MainCategories', catGuids);

    // Versioned fields (translatable)
    let versioned = '';
    versioned += renderField(FID_OVERLINE, 'Overline', c.stage?.[0]?.overline, '    ');
    versioned += renderField(FID_SUBLINE, 'Subline', c.stage?.[0]?.subline, '    ');
    versioned += renderField(FID_HERO_TEXT, 'HeroText', c.collectionData?.[0]?.heroText, '    ');

    writeYml(`Training/${c.slug}.yml`, buildItemYml({
      id: collId,
      parent: TRAINING_FOLDER_ID,
      template: COLLECTION_TEMPLATE,
      itemPath: collItemPath,
      sharedFields: shared,
      versionedFields: versioned,
      displayName: c.title,
    }));
    collCount++;

    // ─── Stories under this collection ───
    for (let si = 0; si < childSlugs.length; si++) {
      const storySlug = childSlugs[si];
      const t = trainingBySlug[storySlug];
      if (!t) {
        console.warn(`  WARNING: Training "${storySlug}" not found in Craft data`);
        continue;
      }

      const storyId = contentIdMap[t.slug];
      const storyItemPath = `${collItemPath}/${t.slug}`;

      let sShared = '';
      sShared += renderGuidField(FID_COLOR_THEME, 'ColorTheme', resolveColorTheme(t.colorTheme));
      sShared += renderGuidField(FID_PRODUCTLINE_THEME, 'ProductlineTheme', resolveProductlineTheme(t.productlineTheme));
      sShared += renderField(FID_READING_TIME, 'ReadingTime', t.playlistMetaInformation?.[0]?.readingTime);
      sShared += renderField(FID_STORY_TRAINING_ACTIVITY, 'TrainingActivity', t.trainingActivity);
      const sCatGuids = resolveCategories(t.taxonomy?.[0]?.mainCategories);
      sShared += renderGuidListField(FID_MAIN_CATEGORIES, 'MainCategories', sCatGuids);

      let sVersioned = '';
      sVersioned += renderField(FID_OVERLINE, 'Overline', t.stage?.[0]?.overline, '    ');
      sVersioned += renderField(FID_SUBLINE, 'Subline', t.stage?.[0]?.subline, '    ');

      writeYml(`Training/${c.slug}/${t.slug}.yml`, buildItemYml({
        id: storyId,
        parent: collId,
        template: STORY_TEMPLATE,
        itemPath: storyItemPath,
        sharedFields: sShared,
        versionedFields: sVersioned,
        displayName: t.title,
        sortOrder: (si + 1) * 100,
      }));
      storyCount++;
    }

    // ─── Quiz under this collection ───
    if (quiz) {
      const quizId = contentIdMap[quiz.slug];
      const quizItemPath = `${collItemPath}/${quiz.slug}`;
      const meta = quiz.quizMetaInformation?.[0] || {};

      let qShared = '';
      qShared += renderGuidField(FID_COLOR_THEME, 'ColorTheme', resolveColorTheme(quiz.colorTheme));
      qShared += renderGuidField(FID_PRODUCTLINE_THEME, 'ProductlineTheme', resolveProductlineTheme(quiz.productlineTheme));
      qShared += renderField(FID_PASSING_SCORE, 'PassingScore', meta.passingScore);
      qShared += renderField(FID_NUM_QUESTIONS, 'NumberOfQuestions', meta.numberOfInteractions);
      qShared += renderField(FID_SHUFFLE, 'ShuffleQuestions', meta.shuffleInteractions ? '1' : '');
      qShared += renderField(FID_ENABLE_FEEDBACK, 'EnableFeedback', meta.enableFeedback ? '1' : '');
      qShared += renderField(FID_QUIZ_TRAINING_ACTIVITY, 'TrainingActivity', quiz.trainingActivity);

      let qVersioned = '';
      qVersioned += renderField(FID_OVERLINE, 'Overline', meta.overline, '    ');
      qVersioned += renderField(FID_SUBLINE, 'Subline', meta.subline, '    ');
      qVersioned += renderField(FID_INSTRUCTION_TEXT, 'InstructionText', meta.text, '    ');
      qVersioned += renderField(FID_PASS_HEADLINE, 'PassHeadline', quiz.positiveFeedback?.[0]?.feedbackHeadline, '    ');
      qVersioned += renderField(FID_PASS_TEXT, 'PassText', quiz.positiveFeedback?.[0]?.feedbackText, '    ');
      qVersioned += renderField(FID_FAIL_HEADLINE, 'FailHeadline', quiz.negativeFeedback?.[0]?.feedbackHeadline, '    ');
      qVersioned += renderField(FID_FAIL_TEXT, 'FailText', quiz.negativeFeedback?.[0]?.feedbackText, '    ');

      writeYml(`Training/${c.slug}/${quiz.slug}.yml`, buildItemYml({
        id: quizId,
        parent: collId,
        template: QUIZ_TEMPLATE,
        itemPath: quizItemPath,
        sharedFields: qShared,
        versionedFields: qVersioned,
        displayName: quiz.title,
      }));
      quizCount++;

      // ─── Questions under this quiz ───
      const quizInteractions = quiz.interactions || [];
      for (let qi = 0; qi < quizInteractions.length; qi++) {
        const iRef = quizInteractions[qi];
        const interaction = interactionBySlug[iRef.slug];
        if (!interaction) {
          console.warn(`  WARNING: Interaction "${iRef.slug}" not found`);
          continue;
        }

        const builder = interaction.interactionBuilder?.[0];
        if (!builder) continue;

        const typename = builder.__typename;
        const templateId = QUESTION_TYPE_MAP[typename];
        if (!templateId) {
          console.warn(`  WARNING: Unknown question type "${typename}" for ${iRef.slug}`);
          continue;
        }

        const iId = contentIdMap[interaction.slug];
        const iItemPath = `${quizItemPath}/${interaction.slug}`;
        let iShared = '';
        let iVersioned = '';

        // Common question fields (versioned — translatable)
        iVersioned += renderField(FID_Q_OVERLINE, 'QuestionOverline', builder.questionOverline, '    ');
        iVersioned += renderField(FID_Q_TEXT, 'QuestionText', builder.question, '    ');
        iVersioned += renderField(FID_Q_INSTRUCTION, 'QuestionInstruction', builder.questionInstruction, '    ');

        // Common feedback (versioned)
        iVersioned += renderField(FID_Q_POS_FB, 'PositiveFeedbackText', builder.positiveFeedback?.[0]?.feedbackText, '    ');
        iVersioned += renderField(FID_Q_NEG_FB, 'NegativeFeedbackText', builder.negativeFeedback?.[0]?.feedbackText, '    ');
        iVersioned += renderField(FID_Q_SOL_FB, 'SolutionFeedbackText', builder.solutionFeedback?.[0]?.feedbackText, '    ');

        // Type-specific fields
        switch (typename) {
          case 'interactionBuilder_choiceModule_BlockType':
            iShared += renderField(FID_FORCE_MULTI, 'ForceMultipleChoice', builder.forceMultipleChoice ? '1' : '');
            iShared += renderField(FID_CHOICE_NO_SHUFFLE, 'DisableShuffle', builder.disableShuffle ? '1' : '');
            break;

          case 'interactionBuilder_trueFalseModule_BlockType': {
            const tfOpt = builder.trueFalseAnswerOptions?.[0];
            if (tfOpt) {
              iVersioned += renderField(FID_TF_TRUE_LABEL, 'TrueLabel', tfOpt.trueLabel, '    ');
              iVersioned += renderField(FID_TF_FALSE_LABEL, 'FalseLabel', tfOpt.falseLabel, '    ');
              iShared += renderField(FID_TF_CORRECT, 'CorrectAnswer', tfOpt.correctAnswer === true || tfOpt.correctAnswer === 'true' ? '1' : '');
            }
            break;
          }

          case 'interactionBuilder_valueSliderModule_BlockType': {
            const sl = builder.valueSliderConfiguration?.[0];
            if (sl) {
              iShared += renderField(FID_SL_MIN, 'MinValue', sl.minValue);
              iShared += renderField(FID_SL_MAX, 'MaxValue', sl.maxValue);
              iShared += renderField(FID_SL_STEPS, 'Steps', sl.steps);
              iShared += renderField(FID_SL_INIT, 'InitialValue', sl.initialValue);
              iShared += renderField(FID_SL_CORRECT, 'CorrectValue', sl.correctValue);
              iShared += renderField(FID_SL_THRESHOLD, 'CorrectThreshold', sl.correctThreshold);
              iVersioned += renderField(FID_SL_MIN_LABEL, 'MinLabel', sl.minLabel, '    ');
              iVersioned += renderField(FID_SL_MAX_LABEL, 'MaxLabel', sl.maxLabel, '    ');
              iVersioned += renderField(FID_SL_VAL_LABEL, 'ValueLabel', sl.currentValueLabel, '    ');
            }
            break;
          }

          case 'interactionBuilder_DragDropModule_BlockType':
            iShared += renderField(FID_DD_NO_SHUFFLE, 'DisableShuffle', builder.disableShuffle ? '1' : '');
            break;

          case 'interactionBuilder_fillTheBlankModule_BlockType':
            iVersioned += renderField(FID_FB_TEXT, 'BlankText', builder.textWithoutFormating, '    ');
            break;

          case 'interactionBuilder_sortableRankingListModule_BlockType':
            // No type-specific fields on the question itself; items are children
            break;
        }

        writeYml(`Training/${c.slug}/${quiz.slug}/${interaction.slug}.yml`, buildItemYml({
          id: iId,
          parent: quizId,
          template: templateId,
          itemPath: iItemPath,
          sharedFields: iShared || undefined,
          versionedFields: iVersioned,
          displayName: interaction.title,
          sortOrder: (qi + 1) * 100,
        }));
        questionCount++;

        // ─── Child items for Choice, DragDrop, Sortable ───
        if (typename === 'interactionBuilder_choiceModule_BlockType' && builder.choiceAnswerOptions) {
          builder.choiceAnswerOptions.forEach((ans, ai) => {
            const ansId = contentGuid(`${interaction.slug}-answer-${ai}`);
            const ansItemPath = `${iItemPath}/answer-${ai + 1}`;
            let aShared = '';
            aShared += renderField(FID_ANS_CORRECT, 'IsCorrect', ans.correctAnswer ? '1' : '');
            let aVersioned = '';
            aVersioned += renderField(FID_ANS_TEXT, 'AnswerText', ans.answerText, '    ');

            writeYml(`Training/${c.slug}/${quiz.slug}/${interaction.slug}/answer-${ai + 1}.yml`, buildItemYml({
              id: ansId,
              parent: iId,
              template: CHOICE_ANS_TEMPLATE,
              itemPath: ansItemPath,
              sharedFields: aShared || undefined,
              versionedFields: aVersioned,
              displayName: `Answer ${ai + 1}`,
              sortOrder: (ai + 1) * 100,
            }));
            answerCount++;
          });
        }

        if (typename === 'interactionBuilder_DragDropModule_BlockType' && builder.dragDrop) {
          builder.dragDrop.forEach((pair, pi) => {
            const pairId = contentGuid(`${interaction.slug}-pair-${pi}`);
            const pairItemPath = `${iItemPath}/pair-${pi + 1}`;
            let pVersioned = '';
            // Drag side
            const dragBlock = pair.drag?.[0];
            if (dragBlock?.__typename === 'drag_dragDropText_BlockType') {
              pVersioned += renderField(FID_DD_DRAG_TEXT, 'DragText', dragBlock.textComponent, '    ');
            }
            // Drop side
            const dropBlock = pair.drop?.[0];
            if (dropBlock?.__typename === 'drop_dropText_BlockType') {
              pVersioned += renderField(FID_DD_DROP_TEXT, 'DropText', dropBlock.textComponent, '    ');
            }

            writeYml(`Training/${c.slug}/${quiz.slug}/${interaction.slug}/pair-${pi + 1}.yml`, buildItemYml({
              id: pairId,
              parent: iId,
              template: DD_PAIR_TEMPLATE,
              itemPath: pairItemPath,
              versionedFields: pVersioned,
              displayName: `Pair ${pi + 1}`,
              sortOrder: (pi + 1) * 100,
            }));
            answerCount++;
          });
        }

        if (typename === 'interactionBuilder_sortableRankingListModule_BlockType' && builder.sortableAnswerItems) {
          builder.sortableAnswerItems.forEach((item, si) => {
            const sItemId = contentGuid(`${interaction.slug}-sort-${si}`);
            const sItemPath = `${iItemPath}/item-${si + 1}`;
            let sVersioned = '';
            sVersioned += renderField(FID_SORT_ITEM_TEXT, 'ItemText', item.item, '    ');

            writeYml(`Training/${c.slug}/${quiz.slug}/${interaction.slug}/item-${si + 1}.yml`, buildItemYml({
              id: sItemId,
              parent: iId,
              template: SORT_ITEM_TEMPLATE,
              itemPath: sItemPath,
              versionedFields: sVersioned,
              displayName: `Item ${si + 1}`,
              sortOrder: (si + 1) * 100,
            }));
            answerCount++;
          });
        }
      }
    }
  }

  // Save content ID map for future use
  fs.writeFileSync(
    path.join(__dirname, 'content-id-map.json'),
    JSON.stringify(contentIdMap, null, 2),
    'utf8'
  );

  const total = collCount + storyCount + quizCount + questionCount + answerCount;
  console.log(`\nGenerated:`);
  console.log(`  Collections: ${collCount}`);
  console.log(`  Stories:      ${storyCount}`);
  console.log(`  Quizzes:      ${quizCount}`);
  console.log(`  Questions:    ${questionCount}`);
  console.log(`  Answers:      ${answerCount}`);
  console.log(`  Total YML:    ${total}`);
  console.log(`\nOutput: ${OUT}`);
  console.log(`Content ID map: content-id-map.json`);
}

/**
 * Build chapter order from previousChapter/nextChapter chain.
 * Finds the first story (no previousChapter) and follows nextChapter links.
 * Appends quiz at the end if present.
 */
function buildChapterOrder(storySlugs, trainingBySlug, quiz) {
  if (storySlugs.length === 0) {
    return quiz ? [quiz.slug] : [];
  }

  // Find the first story (no previousChapter)
  let firstSlug = null;
  for (const slug of storySlugs) {
    const t = trainingBySlug[slug];
    if (!t) continue;
    const prev = t.contentDependencies?.[0]?.previousChapter;
    if (!prev || prev.length === 0) {
      firstSlug = slug;
      break;
    }
  }

  if (!firstSlug) {
    // Fallback: use order as-is
    const result = [...storySlugs];
    if (quiz) result.push(quiz.slug);
    return result;
  }

  // Follow the chain
  const ordered = [];
  let current = firstSlug;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    ordered.push(current);
    const t = trainingBySlug[current];
    if (!t) break;
    const next = t.contentDependencies?.[0]?.nextChapter?.[0]?.slug;
    // If next is a quiz, stop — we'll add it separately
    if (next && storySlugs.includes(next)) {
      current = next;
    } else {
      break;
    }
  }

  // Add any stories not reached by the chain
  for (const slug of storySlugs) {
    if (!ordered.includes(slug)) {
      ordered.push(slug);
    }
  }

  // Append quiz at the end
  if (quiz) {
    ordered.push(quiz.slug);
  }

  return ordered;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
