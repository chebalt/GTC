/**
 * READ-ONLY — Probe 3: Get lesson slugs, compare body text across languages,
 * fix quiz UI string field names.
 * NO mutations. Safe to run against production.
 */
const https = require('https');
const fs = require('fs');

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

async function run() {
  console.log('=== READ-ONLY Probe 3: Translation content & UI strings ===\n');

  // ── Step 1: Get lessons in ceramics trainings via globalTracking ──────────
  console.log('--- Step 1: Get ceramics collection stories via globalTracking ---');
  const r1 = await gql(`{
    globalTracking: globalSets(handle: "globalTracking") {
      ... on globalTracking_GlobalSet {
        courseData {
          __typename
          ... on courseData_collections_BlockType {
            collection { id title slug }
            stories { id title slug uri __typename }
          }
        }
      }
    }
  }`);

  const trackingData = r1.data?.globalTracking?.[0]?.courseData || [];
  const ceramicsEntry = trackingData.find(cd =>
    cd.__typename === 'courseData_collections_BlockType' &&
    cd.collection?.some(c => c.slug === 'grohe-ceramics-basics')
  );

  const lessonSlugs = ceramicsEntry?.stories?.map(s => s.slug) || [];
  console.log('  Ceramics lesson slugs:', lessonSlugs.slice(0, 5));
  console.log('  Total lessons in ceramics:', lessonSlugs.length);

  if (lessonSlugs.length === 0) {
    // Fallback: query first 3 lessons directly
    const rFall = await gql(`{ lessonsEntries(limit: 3) { id title slug } }`);
    const fallback = rFall.data?.lessonsEntries || [];
    lessonSlugs.push(...fallback.map(l => l.slug));
    console.log('  (using fallback lesson slugs:', lessonSlugs, ')');
  }

  // ── Step 2: Compare lesson text across languages ───────────────────────────
  console.log('\n--- Step 2: Lesson body text comparison (first lesson, 6 languages) ---');
  const testSlug = lessonSlugs[0];
  const textLangs = ['enGB', 'de', 'fr', 'ru', 'ar', 'uk'];

  if (testSlug) {
    for (const site of textLangs) {
      const r = await gql(`{
        lessonsEntries(site: "${site}", slug: "${testSlug}") {
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
                  ... on headingComponent_BlockType { headline overline }
                }
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

      if (r.errors) { console.log(`  [${site}]: ERROR`, r.errors[0]?.message?.substring(0, 60)); continue; }
      const entry = r.data?.lessonsEntries?.[0];
      if (!entry) { console.log(`  [${site}]: no entry for "${testSlug}"`); continue; }

      const meta = entry.nuggetMetaInformation?.[0];
      const firstText = entry.contentBuilder?.find(b => b.__typename === 'contentBuilder_textModule_BlockType');
      let textSnippet = firstText?.textComponent?.replace(/<[^>]+>/g,'').substring(0, 100) || '';

      // If no textModule, try multicolumn first nested text
      if (!textSnippet) {
        const mc = entry.contentBuilder?.find(b => b.__typename === 'contentBuilder_multicolumnModule_BlockType');
        const col = mc?.children?.[0]?.children?.[0];
        textSnippet = col?.textComponent?.replace(/<[^>]+>/g,'').substring(0, 100) || '(no text found)';
      }

      console.log(`  [${site}/${entry.language}] headline="${meta?.headline || 'none'}" | body: "${textSnippet}"`);
    }
  }

  // ── Step 3: Inspect globalInteractionTexts field names ────────────────────
  console.log('\n--- Step 3: Discover correct field names in globalInteractionTexts ---');
  const r3 = await gql(`{
    globalSets(handle: "globalUiTexts") {
      ... on globalUiTexts_GlobalSet {
        language
        globalInteractionTexts {
          __typename
        }
      }
    }
  }`);
  console.log('  globalInteractionTexts __typename:', r3.data?.globalSets?.[0]?.globalInteractionTexts?.[0]?.__typename);

  // Try introspecting the type name to find fields
  const r3b = await gql(`{
    __type(name: "globalInteractionTexts_BlockType") {
      fields { name }
    }
  }`);
  const fields = r3b.data?.__type?.fields?.map(f => f.name) || [];
  console.log('  globalInteractionTexts_BlockType fields:', fields.join(', '));

  // ── Step 4: Query interaction texts with correct field names ──────────────
  if (fields.length > 0) {
    const fieldList = fields.slice(0, 15).join('\n          ');
    console.log('\n--- Step 4: Quiz UI texts across languages (de, fr, ru, ar) ---');
    const quizLangs = ['enGB', 'de', 'fr', 'ru', 'ar'];
    for (const site of quizLangs) {
      const r = await gql(`{
        globalSets(handle: "globalUiTexts", site: "${site}") {
          ... on globalUiTexts_GlobalSet {
            language
            globalInteractionTexts {
              ... on globalInteractionTexts_BlockType {
                ${fieldList}
              }
            }
          }
        }
      }`);
      if (r.errors) { console.log(`  [${site}]: ERROR`); continue; }
      const it = r.data?.globalSets?.[0]?.globalInteractionTexts?.[0];
      const lang = r.data?.globalSets?.[0]?.language;
      if (!it) { console.log(`  [${site}]: no data`); continue; }
      // Show first 5 non-empty values
      const vals = Object.entries(it).filter(([k,v]) => v && k !== '__typename').slice(0,5);
      console.log(`  [${site}/${lang}]:`, vals.map(([k,v]) => `${k}="${String(v).substring(0,40)}"`).join(' | '));
    }
  }

  // ── Step 5: Check if an 'it' (Italian) site actually exists ───────────────
  console.log('\n--- Step 5: Discover all valid site handles via site="*" ---');
  const r5 = await gql(`{
    coursesEntries(site: "*", limit: 100) {
      siteHandle language
    }
  }`);
  if (!r5.errors) {
    const sites = r5.data?.coursesEntries || [];
    const siteMap = {};
    sites.forEach(s => { siteMap[s.siteHandle] = s.language; });
    console.log('  All site handles found (from 100 entries sample):');
    Object.entries(siteMap).forEach(([h, l]) => console.log(`    ${h} → ${l}`));
  }

  // ── Step 6: Check entries where localized content DIFFERS (proof of real translation) ─
  console.log('\n--- Step 6: Check if any training title differs between enGB and de ---');
  const r6 = await gql(`{
    enEntries: trainingsEntries(site: "enGB", limit: 10) { title slug }
    deEntries: trainingsEntries(site: "de", limit: 10) { title slug }
  }`);
  if (!r6.errors) {
    const en = r6.data?.enEntries || [];
    const de = r6.data?.deEntries || [];
    const deBySlug = {};
    de.forEach(e => deBySlug[e.slug] = e.title);
    console.log('  Comparing titles (en vs de):');
    en.forEach(e => {
      const deTitle = deBySlug[e.slug];
      const diff = deTitle && deTitle !== e.title ? ' *** DIFFERS ***' : '';
      if (deTitle) console.log(`    "${e.title}" → DE: "${deTitle}"${diff}`);
    });
  }

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
