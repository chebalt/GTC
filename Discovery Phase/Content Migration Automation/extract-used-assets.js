#!/usr/bin/env node
/**
 * Extract all assets actually referenced in GTC training content.
 * Approach: For each training/collection/quiz, query content blocks and
 * recursively collect all asset URLs.
 *
 * Since the full content query is huge, we use a simpler strategy:
 * Query the Craft assets API with `relatedToEntries` to find assets
 * that are linked from content entries.
 *
 * READ-ONLY. No mutations.
 */
const fs = require('fs');
const path = require('path');

const ENDPOINT = 'https://lc.training.grohe.this.work/api';
const TOKEN = 'atY-GV3UKeDqcYOipuCbfgCqBtp_Dd5b';
const OUT_DIR = path.join(__dirname);

async function gqlRequest(query, variables = {}) {
  const body = JSON.stringify({ query, variables });
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + TOKEN,
    },
    body,
  });
  const json = await resp.json();
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2).substring(0, 500));
  }
  return json.data;
}

// ── Step 1: Get all entry IDs (collections, trainings, quizzes, interactions) ──
async function getAllEntryIds() {
  console.log('Fetching all entry IDs...');

  const data = await gqlRequest(`{
    collections: coursesEntries(limit: 200) { ... on courses_courses_Entry { id slug } }
    trainings: trainingsEntries(limit: 500) { ... on trainings_trainings_Entry { id slug } }
    quizzes: quizzesEntries(limit: 100) { ... on quizzes_quizzes_Entry { id slug } }
    interactions: quizInteractionsEntries(limit: 500) { ... on quizInteractions_quizInteractions_Entry { id slug } }
  }`);

  const ids = [];
  for (const key of ['collections', 'trainings', 'quizzes', 'interactions']) {
    const entries = data[key] || [];
    console.log(`  ${key}: ${entries.length} entries`);
    ids.push(...entries.map(e => ({ id: e.id, slug: e.slug, type: key })));
  }
  return ids;
}

// ── Step 2: Query assets related to entries (in batches) ──
async function getRelatedAssets(entryIds) {
  console.log(`\nQuerying assets related to ${entryIds.length} entries...`);

  const allAssets = new Map(); // url -> asset info
  const BATCH = 50;

  for (let i = 0; i < entryIds.length; i += BATCH) {
    const batch = entryIds.slice(i, i + BATCH);
    const ids = batch.map(e => parseInt(e.id));

    const data = await gqlRequest(`
      query($ids: [Int]) {
        assets(relatedToEntries: [{id: $ids}], limit: 5000, kind: ["image", "video", "pdf", "audio", "compressed"]) {
          id filename url kind mimeType size width height
          folderPath: volume
        }
      }
    `, { ids });

    if (data?.assets) {
      for (const a of data.assets) {
        if (a.url && !allAssets.has(a.url)) {
          allAssets.set(a.url, a);
        }
      }
    }

    process.stdout.write(`  Batch ${Math.floor(i/BATCH)+1}/${Math.ceil(entryIds.length/BATCH)} — ${allAssets.size} unique assets so far\r`);
  }

  console.log(`\n  Total unique referenced assets: ${allAssets.size}`);
  return allAssets;
}

// ── Step 3: Alternative — query ALL assets, then compare ──
async function getAllAssets() {
  console.log('\nFetching ALL assets from Craft (for comparison)...');
  const allAssets = new Map();
  let offset = 0;
  const LIMIT = 500;

  while (true) {
    const data = await gqlRequest(`
      query($offset: Int, $limit: Int) {
        assets(offset: $offset, limit: $limit) {
          id filename url kind mimeType size width height
        }
      }
    `, { offset, limit: LIMIT });

    if (!data?.assets || data.assets.length === 0) break;

    for (const a of data.assets) {
      if (a.url) allAssets.set(a.url, a);
    }

    process.stdout.write(`  Fetched ${allAssets.size} assets...\r`);
    offset += LIMIT;
    if (data.assets.length < LIMIT) break;
  }

  console.log(`\n  Total assets in Craft: ${allAssets.size}`);
  return allAssets;
}

// ── Step 4: Cross-reference with local manifest ──
function loadManifest() {
  const csv = fs.readFileSync(path.join(__dirname, '../../CRAFT database/asset_manifest.csv'), 'utf8');
  const lines = csv.trim().split('\n');
  const assets = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 5) {
      const [volume, folderPath, filename, kind, size] = parts;
      const fullPath = `${volume}/${folderPath}${filename}`;
      const url = `/assets/${volume}/${folderPath}${filename}`;
      assets.push({ volume, folderPath, filename, kind, size: parseInt(size), fullPath, url });
    }
  }
  return assets;
}

// ── Main ──
(async () => {
  console.log('=== GTC Asset Usage Analysis ===\n');

  // Get all entry IDs
  const entries = await getAllEntryIds();

  // Get referenced assets
  const referencedAssets = await getRelatedAssets(entries);

  // Get ALL assets for comparison
  const allCraftAssets = await getAllAssets();

  // Load local manifest
  const manifest = loadManifest();
  console.log(`\nLocal manifest: ${manifest.length} files`);

  // Build lookup: normalize URLs for matching
  // Craft URLs look like: https://lc.training.grohe.this.work/assets/images/...
  // Manifest paths look like: /assets/images/...
  const referencedPaths = new Set();
  for (const [url] of referencedAssets) {
    // Extract path after domain
    const m = url.match(/\/assets\/.+/);
    if (m) referencedPaths.add(decodeURIComponent(m[0]));
  }

  const allCraftPaths = new Set();
  for (const [url] of allCraftAssets) {
    const m = url.match(/\/assets\/.+/);
    if (m) allCraftPaths.add(decodeURIComponent(m[0]));
  }

  // Match manifest entries
  let usedCount = 0, unusedCount = 0, usedSize = 0, unusedSize = 0;
  const usedFiles = [];
  const unusedFiles = [];

  for (const mf of manifest) {
    const isReferenced = referencedPaths.has(mf.url) ||
      referencedPaths.has(encodeURI(mf.url)) ||
      [...referencedPaths].some(p => p.endsWith('/' + mf.filename));

    if (isReferenced) {
      usedCount++;
      usedSize += mf.size;
      usedFiles.push(mf);
    } else {
      unusedCount++;
      unusedSize += mf.size;
      unusedFiles.push(mf);
    }
  }

  // ── Report ──
  console.log('\n========================================');
  console.log('         ASSET USAGE REPORT');
  console.log('========================================\n');

  console.log(`Assets in Craft DB (manifest):    ${manifest.length}`);
  console.log(`Assets in Craft GraphQL:          ${allCraftAssets.size}`);
  console.log(`Assets referenced by entries:      ${referencedAssets.size}`);
  console.log('');
  console.log(`USED (referenced by content):      ${usedCount} files (${(usedSize/1048576).toFixed(1)} MB)`);
  console.log(`UNUSED (not referenced):           ${unusedCount} files (${(unusedSize/1048576).toFixed(1)} MB)`);

  // Breakdown by kind
  const byKind = { used: {}, unused: {} };
  for (const f of usedFiles) {
    byKind.used[f.kind] = (byKind.used[f.kind] || { count: 0, size: 0 });
    byKind.used[f.kind].count++;
    byKind.used[f.kind].size += f.size;
  }
  for (const f of unusedFiles) {
    byKind.unused[f.kind] = (byKind.unused[f.kind] || { count: 0, size: 0 });
    byKind.unused[f.kind].count++;
    byKind.unused[f.kind].size += f.size;
  }

  console.log('\n--- By Type ---');
  console.log('Type        | Used (count/size)      | Unused (count/size)');
  console.log('------------|------------------------|------------------------');
  for (const kind of new Set([...Object.keys(byKind.used), ...Object.keys(byKind.unused)])) {
    const u = byKind.used[kind] || { count: 0, size: 0 };
    const n = byKind.unused[kind] || { count: 0, size: 0 };
    console.log(`${kind.padEnd(12)}| ${String(u.count).padStart(5)} / ${(u.size/1048576).toFixed(1).padStart(8)} MB | ${String(n.count).padStart(5)} / ${(n.size/1048576).toFixed(1).padStart(8)} MB`);
  }

  // Top 20 largest unused files
  unusedFiles.sort((a, b) => b.size - a.size);
  console.log('\n--- Top 20 Largest Unused Files ---');
  for (const f of unusedFiles.slice(0, 20)) {
    console.log(`  ${(f.size/1048576).toFixed(1).padStart(7)} MB  ${f.volume}/${f.folderPath}${f.filename}`);
  }

  // Top 20 largest used files
  usedFiles.sort((a, b) => b.size - a.size);
  console.log('\n--- Top 20 Largest Used Files ---');
  for (const f of usedFiles.slice(0, 20)) {
    console.log(`  ${(f.size/1048576).toFixed(1).padStart(7)} MB  ${f.volume}/${f.folderPath}${f.filename}`);
  }

  // Save detailed results
  const report = {
    summary: {
      manifestTotal: manifest.length,
      craftGraphqlTotal: allCraftAssets.size,
      referencedByEntries: referencedAssets.size,
      usedCount,
      unusedCount,
      usedSizeMB: +(usedSize / 1048576).toFixed(1),
      unusedSizeMB: +(unusedSize / 1048576).toFixed(1),
    },
    usedFiles: usedFiles.map(f => ({ path: `${f.volume}/${f.folderPath}${f.filename}`, kind: f.kind, sizeMB: +(f.size/1048576).toFixed(2) })),
    unusedFiles: unusedFiles.map(f => ({ path: `${f.volume}/${f.folderPath}${f.filename}`, kind: f.kind, sizeMB: +(f.size/1048576).toFixed(2) })),
  };

  const outPath = path.join(OUT_DIR, 'asset-usage-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${outPath}`);
})();
