/**
 * READ-ONLY — Probe 4: Final targeted checks.
 * 1. Get actual lesson slugs (not training slugs)
 * 2. Compare lesson body text across languages
 * 3. Fix quiz UI strings query (scalar fields only)
 * 4. Verify training title translations at scale
 * NO mutations. Safe to run against production.
 */
const https = require('https');

const ENDPOINT = 'https://lc.training.grohe.this.work/api';
const TOKEN = 'atY-GV3UKeDqcYOipuCbfgCqBtp_Dd5b';

function gql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const url = new URL(ENDPOINT);
    const req = https.request({
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 100);
}

async function run() {
  console.log('=== READ-ONLY Probe 4: Final targeted checks ===\n');

  // ── Step 1: Get actual lesson/nugget slugs (lessonsEntries, not trainings) ─
  console.log('--- Step 1: Get 5 lesson slugs directly from lessonsEntries ---');
  const r1 = await gql(`{
    lessonsEntries(site: "enGB", limit: 5) {
      id title slug language siteHandle
    }
  }`);
  const lessons = r1.data?.lessonsEntries || [];
  console.log('  Lessons found:', lessons.map(l => l.slug));

  // ── Step 2: Compare first lesson body text across 6 languages ─────────────
  if (lessons.length > 0) {
    const testSlug = lessons[0].slug;
    console.log(`\n--- Step 2: Body text comparison for lesson "${testSlug}" ---`);
    const langs = ['enGB', 'de', 'fr', 'ru', 'ar', 'uk'];
    for (const site of langs) {
      const r = await gql(`{
        lessonsEntries(site: "${site}", slug: "${testSlug}") {
          ... on lessons_lessons_Entry {
            language siteHandle title
            nuggetMetaInformation {
              ... on nuggetMetaInformation_BlockType { headline overline }
            }
            contentBuilder {
              __typename
              ... on contentBuilder_textModule_BlockType { textComponent }
              ... on contentBuilder_headingModule_BlockType {
                headingComponent { ... on headingComponent_BlockType { headline } }
              }
              ... on contentBuilder_multicolumnModule_BlockType {
                children {
                  __typename
                  ... on contentBuilder_column_BlockType {
                    children {
                      __typename
                      ... on contentBuilder_nestedTextComponent_BlockType { textComponent }
                    }
                  }
                }
              }
            }
          }
        }
      }`);
      if (r.errors) { console.log(`  [${site}]: ERROR`); continue; }
      const entry = r.data?.lessonsEntries?.[0];
      if (!entry) { console.log(`  [${site}]: no entry`); continue; }
      const meta = entry.nuggetMetaInformation?.[0];
      // Find first text content
      let text = '';
      for (const b of (entry.contentBuilder || [])) {
        if (b.__typename === 'contentBuilder_textModule_BlockType') {
          text = stripHtml(b.textComponent); break;
        }
        if (b.__typename === 'contentBuilder_multicolumnModule_BlockType') {
          for (const col of (b.children || [])) {
            for (const child of (col.children || [])) {
              if (child.__typename === 'contentBuilder_nestedTextComponent_BlockType') {
                text = stripHtml(child.textComponent); break;
              }
            }
            if (text) break;
          }
          if (text) break;
        }
      }
      console.log(`  [${site}/${entry.language}] title="${entry.title}" | headline="${meta?.headline || 'none'}"`);
      console.log(`    text: "${text || '(no plain text found)'}"`);
    }
  }

  // ── Step 3: Quiz UI strings — scalar fields only ───────────────────────────
  console.log('\n--- Step 3: Quiz interaction UI strings across languages ---');
  // Only scalar text fields (skip id, uid, etc.)
  const scalarFields = `
    singleChoiceInstruction
    singleChoiceImageInstruction
    multipleChoiceInstruction
    trueFalseInstruction
    dragDropInstruction
    sortableRankingInstruction
    fillTheBlankInstruction
    trueFalseTrueLabel
    trueFalseFalseLabel
    confirmationButton
    retryButton
    solutionButton
    quizStartButton
    quizRestartButton
    positiveFeedbackHeadline
    negativeFeedbackHeadline
    positiveQuizFeedbackHeadline
    negativeQuizFeedbackHeadline
  `;
  const quizLangs = ['enGB', 'de', 'fr', 'ru', 'ar'];
  for (const site of quizLangs) {
    const r = await gql(`{
      globalSets(handle: "globalUiTexts", site: "${site}") {
        ... on globalUiTexts_GlobalSet {
          language
          globalInteractionTexts {
            ... on globalInteractionTexts_BlockType {
              ${scalarFields}
            }
          }
        }
      }
    }`);
    if (r.errors) {
      console.log(`  [${site}]: ERROR`, r.errors[0]?.message?.substring(0, 100));
      continue;
    }
    const it = r.data?.globalSets?.[0]?.globalInteractionTexts?.[0];
    const lang = r.data?.globalSets?.[0]?.language;
    if (!it) { console.log(`  [${site}]: no data`); continue; }
    console.log(`  [${site}/${lang}]:`);
    console.log(`    confirmBtn="${it.confirmationButton}" | retryBtn="${it.retryButton}" | startQuiz="${it.quizStartButton}"`);
    console.log(`    singleChoice="${(it.singleChoiceInstruction||'').substring(0,60)}"`);
    console.log(`    trueLabel="${it.trueFalseTrueLabel}" | falseLabel="${it.trueFalseFalseLabel}"`);
  }

  // ── Step 4: Training title translation at scale (all 305, de vs en) ────────
  console.log('\n--- Step 4: How many training titles differ between EN and DE? ---');
  const r4en = await gql(`{ trainingsEntries(site: "enGB") { title slug } }`);
  const r4de = await gql(`{ trainingsEntries(site: "de") { title slug } }`);
  const enTrainings = r4en.data?.trainingsEntries || [];
  const deTrainings = r4de.data?.trainingsEntries || [];
  const deBySlug = {};
  deTrainings.forEach(e => deBySlug[e.slug] = e.title);
  let same = 0, differ = 0, missingInDE = 0;
  const differExamples = [];
  enTrainings.forEach(e => {
    if (!deBySlug[e.slug]) { missingInDE++; return; }
    if (deBySlug[e.slug] === e.title) { same++; }
    else { differ++; if (differExamples.length < 5) differExamples.push({ en: e.title, de: deBySlug[e.slug] }); }
  });
  console.log(`  EN: ${enTrainings.length} trainings | DE: ${deTrainings.length} trainings`);
  console.log(`  Same title: ${same} | Different title: ${differ} | Missing in DE: ${missingInDE}`);
  console.log('  Example differences:');
  differExamples.forEach(d => console.log(`    EN: "${d.en}"\n    DE: "${d.de}"`));

  // ── Step 5: Compare lesson titles (all 861 enGB vs 816 de) ────────────────
  console.log('\n--- Step 5: Lesson title diff EN vs DE ---');
  const r5en = await gql(`{ lessonsEntries(site: "enGB") { title slug } }`);
  const r5de = await gql(`{ lessonsEntries(site: "de") { title slug } }`);
  const enLessons = r5en.data?.lessonsEntries || [];
  const deLessons = r5de.data?.lessonsEntries || [];
  const deLessonsBySlug = {};
  deLessons.forEach(e => deLessonsBySlug[e.slug] = e.title);
  let lSame = 0, lDiffer = 0, lMissing = 0;
  const lDifferExamples = [];
  enLessons.forEach(e => {
    if (!deLessonsBySlug[e.slug]) { lMissing++; return; }
    if (deLessonsBySlug[e.slug] === e.title) { lSame++; }
    else { lDiffer++; if (lDifferExamples.length < 3) lDifferExamples.push({ en: e.title, de: deLessonsBySlug[e.slug] }); }
  });
  console.log(`  EN: ${enLessons.length} lessons | DE: ${deLessons.length} lessons`);
  console.log(`  Same title: ${lSame} | Different title: ${lDiffer} | Not in DE: ${lMissing}`);
  if (lDifferExamples.length > 0) {
    console.log('  Example differences:');
    lDifferExamples.forEach(d => console.log(`    EN: "${d.en}"\n    DE: "${d.de}"`));
  }

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
