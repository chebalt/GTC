/**
 * READ-ONLY — Deep probe of multilingual content quality and structure.
 * NO mutations. Safe to run against production.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const ENDPOINT = 'https://lc.training.grohe.this.work/api';
const TOKEN = 'atY-GV3UKeDqcYOipuCbfgCqBtp_Dd5b';

function gql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const url = new URL(ENDPOINT);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
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

// Known 19 site handles from probe 1
const ALL_SITES = ['enGB', 'de', 'hu', 'da', 'el', 'bg', 'nl', 'tr', 'es', 'hr', 'pt', 'fr', 'ar', 'cs', 'pl', 'uk', 'nb', 'fi', 'ru'];

async function run() {
  console.log('=== READ-ONLY Deep Localization Probe ===\n');

  // ── Test 1: Counts per language — are all languages actually populated? ────
  console.log('--- Test 1: Content counts per language (coursesEntries) ---');
  const countResults = {};
  for (const site of ALL_SITES) {
    const r = await gql(`{
      courses: coursesEntries(site: "${site}") { id }
    }`);
    const count = r.data?.courses?.length ?? 'ERROR';
    countResults[site] = count;
    console.log(`  ${site}: ${count} collections`);
  }

  // ── Test 2: Is content actually translated? Compare a lesson stage across languages ─
  console.log('\n--- Test 2: Compare stage headline across 5 languages (ceramics collection) ---');
  const stageLangs = ['enGB', 'de', 'fr', 'ru', 'ar'];
  for (const site of stageLangs) {
    const r = await gql(`{
      coursesEntries(site: "${site}", slug: "grohe-ceramics-basics") {
        ... on courses_courses_Entry {
          language siteHandle title
          stage {
            ... on stage_BlockType { overline headline subline }
          }
        }
      }
    }`);
    if (r.errors) { console.log('  ' + site + ': ERROR', r.errors[0]?.message); continue; }
    const entry = r.data?.coursesEntries?.[0];
    if (!entry) { console.log('  ' + site + ': no entry'); continue; }
    const stage = entry.stage?.[0];
    console.log(`  [${site}/${entry.language}] title="${entry.title}" | headline="${stage?.headline || 'none'}" | overline="${stage?.overline || 'none'}"`);
  }

  // ── Test 3: Is a lesson's contentBuilder translated? Sample textModule ────
  console.log('\n--- Test 3: Lesson text content comparison across languages ---');
  // Use a known lesson slug from ceramics collection
  const lessonSlugs = ['grohe-ceramics-product-portfolio'];
  const textLangs = ['enGB', 'de', 'fr', 'es', 'uk', 'ar'];
  for (const slug of lessonSlugs) {
    console.log(`  Lesson slug: ${slug}`);
    for (const site of textLangs) {
      const r = await gql(`{
        lessonsEntries(site: "${site}", slug: "${slug}") {
          ... on lessons_lessons_Entry {
            language siteHandle title
            nuggetMetaInformation {
              ... on nuggetMetaInformation_BlockType { headline overline subline }
            }
            contentBuilder {
              __typename
              ... on contentBuilder_textModule_BlockType { textComponent }
              ... on contentBuilder_headingModule_BlockType {
                headingComponent {
                  ... on headingComponent_BlockType { headline }
                }
              }
            }
          }
        }
      }`);
      if (r.errors) { console.log('  ' + site + ': ERROR', r.errors[0]?.message?.substring(0,80)); continue; }
      const entry = r.data?.lessonsEntries?.[0];
      if (!entry) { console.log(`  ${site}: no entry for "${slug}"`); continue; }
      const meta = entry.nuggetMetaInformation?.[0];
      const firstText = entry.contentBuilder?.find(b => b.__typename === 'contentBuilder_textModule_BlockType');
      const textSnippet = firstText?.textComponent?.replace(/<[^>]+>/g,'').substring(0,80) || '(no text)';
      console.log(`    [${site}] title="${entry.title}" | headline="${meta?.headline || 'none'}" | text: "${textSnippet}"`);
    }
  }

  // ── Test 4: Are all 63 collections available in all languages? ─────────────
  console.log('\n--- Test 4: Full collection count check across key languages ---');
  const keyLangs = ['enGB', 'de', 'fr', 'nl', 'es', 'pt', 'ru'];
  for (const site of keyLangs) {
    const r = await gql(`{
      courses: coursesEntries(site: "${site}") { id title }
      trainings: trainingsEntries(site: "${site}") { id }
      lessons: lessonsEntries(site: "${site}") { id }
    }`);
    if (r.errors) { console.log('  ' + site + ': ERROR'); continue; }
    const d = r.data;
    console.log(`  ${site}: ${d?.courses?.length} collections | ${d?.trainings?.length} trainings | ${d?.lessons?.length} lessons`);
  }

  // ── Test 5: globalUiTexts — actual translated UI strings ──────────────────
  console.log('\n--- Test 5: globalUiTexts translated values (5 languages) ---');
  const uiLangs = ['enGB', 'de', 'fr', 'uk', 'ar'];
  for (const site of uiLangs) {
    const r = await gql(`{
      globalSets(handle: "globalUiTexts", site: "${site}") {
        ... on globalUiTexts_GlobalSet {
          language siteHandle
          globalTexts {
            ... on globalTexts_BlockType {
              lockedContentPopupHeadline
              lockedContentPopupBody
              lockedContentPopupCta
              leadPopupHeadline
              leadPopupCta
            }
          }
          globalHeaderTexts {
            ... on globalHeaderTexts_BlockType {
              home logout profile search close
            }
          }
        }
      }
    }`);
    if (r.errors) { console.log('  ' + site + ': ERROR', r.errors[0]?.message); continue; }
    const gs = r.data?.globalSets?.[0];
    if (!gs) { console.log('  ' + site + ': no data'); continue; }
    const t = gs.globalTexts?.[0];
    const h = gs.globalHeaderTexts?.[0];
    console.log(`  [${site}/${gs.language}]`);
    console.log(`    lockedHeadline: "${t?.lockedContentPopupHeadline || 'none'}"`);
    console.log(`    leadHeadline: "${t?.leadPopupHeadline || 'none'}"`);
    console.log(`    header.home: "${h?.home || 'none'}" | header.logout: "${h?.logout || 'none'}"`);
  }

  // ── Test 6: globalInteractionTexts — quiz UI strings translated? ──────────
  console.log('\n--- Test 6: Quiz interaction UI texts across languages ---');
  const quizLangs = ['enGB', 'de', 'fr', 'ru'];
  for (const site of quizLangs) {
    const r = await gql(`{
      globalSets(handle: "globalUiTexts", site: "${site}") {
        ... on globalUiTexts_GlobalSet {
          language
          globalInteractionTexts {
            ... on globalInteractionTexts_BlockType {
              startQuiz restartQuiz confirmButton retryButton
              choiceInstruction trueFalseInstruction
            }
          }
        }
      }
    }`);
    if (r.errors) { console.log('  ' + site + ': ERROR'); continue; }
    const it = r.data?.globalSets?.[0]?.globalInteractionTexts?.[0];
    const lang = r.data?.globalSets?.[0]?.language;
    if (!it) { console.log('  ' + site + ': no data'); continue; }
    console.log(`  [${site}/${lang}] startQuiz="${it.startQuiz}" | confirm="${it.confirmButton}" | choiceInstr="${(it.choiceInstruction||'').substring(0,40)}"`);
  }

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
