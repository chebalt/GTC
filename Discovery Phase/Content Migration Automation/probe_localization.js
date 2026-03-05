/**
 * READ-ONLY probe script — investigating multilingual content access in Craft CMS GraphQL.
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

async function run() {
  console.log('=== READ-ONLY Localization Probe ===\n');

  // ── Test 1: site="*" — discover all site handles ──────────────────────────
  console.log('--- Test 1: site="*" on coursesEntries (limit 5) ---');
  const r1 = await gql(`{
    allSites: coursesEntries(site: "*", limit: 5) {
      id title slug language siteHandle
    }
  }`);
  if (r1.errors) {
    console.log('  Errors:', JSON.stringify(r1.errors, null, 2));
  } else {
    const entries = r1.data?.allSites || [];
    const handles = [...new Set(entries.map(e => e.siteHandle + ' (' + e.language + ')'))];
    console.log('  Unique site/language combos found:', handles);
    console.log('  Total entries returned:', entries.length);
    entries.forEach(e => console.log('   -', e.siteHandle, '|', e.language, '|', e.slug));
  }

  // ── Test 2: localized field with site="*" on ceramics collection ──────────
  console.log('\n--- Test 2: localized field with site="*" ---');
  const r2 = await gql(`{
    coursesEntries(slug: "grohe-ceramics-basics") {
      id title slug language siteHandle
      localized(site: "*") {
        id title slug language siteHandle
      }
    }
  }`);
  if (r2.errors) {
    console.log('  Errors:', JSON.stringify(r2.errors, null, 2));
  } else {
    const entry = r2.data?.coursesEntries?.[0];
    if (entry) {
      console.log('  Source entry:', entry.siteHandle, entry.language);
      console.log('  Localized versions:', entry.localized?.length || 0);
      (entry.localized || []).forEach(l => console.log('   -', l.siteHandle, '|', l.language, '|', l.slug));
    }
  }

  // ── Test 3: language argument with known Craft language codes ─────────────
  const langCodes = ['de', 'de-DE', 'fr', 'fr-FR', 'nl', 'es', 'it', 'pt', 'pl', 'ru', 'zh'];
  console.log('\n--- Test 3: language argument probing ---');
  for (const lang of langCodes) {
    const r = await gql(`{
      coursesEntries(language: "${lang}", limit: 1) {
        id title slug language siteHandle
      }
    }`);
    if (r.errors) {
      console.log('  lang=' + lang + ' → ERROR:', r.errors[0]?.message?.substring(0, 80));
    } else {
      const count = r.data?.coursesEntries?.length || 0;
      const entry = r.data?.coursesEntries?.[0];
      console.log('  lang=' + lang + ' → count:', count, entry ? '| ' + entry.siteHandle + ' | ' + entry.language : '');
    }
  }

  // ── Test 4: common Craft site handle patterns ─────────────────────────────
  const siteHandles = [
    'deDE', 'frFR', 'nlNL', 'esES', 'itIT', 'ptPT', 'plPL', 'ruRU', 'zhCN',
    'de_DE', 'fr_FR', 'de', 'fr', 'nl', 'es', 'it',
    'deDe', 'frFr',
  ];
  console.log('\n--- Test 4: common site handle patterns ---');
  for (const handle of siteHandles) {
    const r = await gql(`{
      coursesEntries(site: "${handle}", limit: 1) {
        id title slug language siteHandle
      }
    }`);
    if (r.errors) {
      // Only show non-generic errors
      const msg = r.errors[0]?.message || '';
      if (!msg.includes('No element was found')) {
        console.log('  site=' + handle + ' → ERROR:', msg.substring(0, 100));
      } else {
        console.log('  site=' + handle + ' → no entries (site may exist but be empty for this section)');
      }
    } else {
      const count = r.data?.coursesEntries?.length || 0;
      const entry = r.data?.coursesEntries?.[0];
      console.log('  site=' + handle + ' → count:', count, entry ? '| ' + entry.language : '');
    }
  }

  // ── Test 5: Check globalUiTexts for all sites — UI strings are translatable ─
  console.log('\n--- Test 5: globalUiTexts with site="*" ---');
  const r5 = await gql(`{
    globalSets(handle: "globalUiTexts", site: "*") {
      ... on globalUiTexts_GlobalSet {
        name language siteHandle
        globalTexts {
          ... on globalTexts_BlockType {
            lockedContentPopupHeadline
            lockedContentPopupCta
          }
        }
      }
    }
  }`);
  if (r5.errors) {
    console.log('  Errors:', JSON.stringify(r5.errors, null, 2));
  } else {
    const sets = r5.data?.globalSets || [];
    console.log('  Global UI text sets returned:', sets.length);
    sets.forEach(s => {
      const headline = s.globalTexts?.[0]?.lockedContentPopupHeadline || '(empty)';
      console.log('   -', s.siteHandle, '|', s.language, '| headline:', headline.substring(0, 50));
    });
  }

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
