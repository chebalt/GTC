/**
 * READ-ONLY — Probe 2: Deeper user/tracking investigation.
 * Check preferences content, group distribution, Craft action endpoints.
 * NO mutations. Safe to run against production.
 */
const https = require('https');

const ENDPOINT = 'https://lc.training.grohe.this.work/api';
const TOKEN = 'atY-GV3UKeDqcYOipuCbfgCqBtp_Dd5b';
const BASE_URL = 'https://lc.training.grohe.this.work';

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

function httpGet(path, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/json, text/html',
        ...extraHeaders
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data.substring(0, 800) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== READ-ONLY User/Tracking Probe 2 ===\n');

  // ── Test 1: User groups distribution ─────────────────────────────────────
  console.log('--- Test 1: Access group distribution across all users ---');
  const r1 = await gql(`{ users(limit: 2891) { accessgroup market } }`);
  if (!r1.errors) {
    const users = r1.data?.users || [];
    const groups = {};
    const markets = {};
    users.forEach(u => {
      (u.accessgroup || 'none').split(',').forEach(g => {
        g = g.trim();
        groups[g] = (groups[g] || 0) + 1;
      });
      const m = u.market || 'none';
      markets[m] = (markets[m] || 0) + 1;
    });
    console.log('  Total users:', users.length);
    console.log('  Access groups:');
    Object.entries(groups).sort((a,b) => b[1]-a[1]).slice(0, 15).forEach(([g,c]) => console.log(`    ${g}: ${c}`));
    console.log('  Top 10 markets:');
    Object.entries(markets).sort((a,b) => b[1]-a[1]).slice(0, 10).forEach(([m,c]) => console.log(`    ${m}: ${c}`));
  }

  // ── Test 2: Sample preferences from a few users — any tracking data? ──────
  console.log('\n--- Test 2: Sample preferences from 10 users ---');
  const r2 = await gql(`{
    users(limit: 10, status: null) {
      id uid email preferences market accessgroup
    }
  }`);
  if (!r2.errors) {
    const users = r2.data?.users || [];
    let hasNonEmptyPrefs = 0;
    users.forEach(u => {
      if (u.preferences && u.preferences !== '[]' && u.preferences.length > 10) {
        hasNonEmptyPrefs++;
        let preview = u.preferences.substring(0, 150);
        console.log(`  uid:${u.uid} prefs: ${preview}`);
      }
    });
    if (hasNonEmptyPrefs === 0) console.log('  All preferences empty or default.');
  }

  // ── Test 3: Craft CMS action API endpoints ────────────────────────────────
  console.log('\n--- Test 3: Craft action controller endpoints ---');
  const actionPaths = [
    '/actions/users/get-remaining-session-time',
    '/actions/users/session-info',
    '/actions/app/get-dashboard-widgets',
    '/actions/users/get-user-groups',
    '/actions/tracking/index',
    '/actions/tracking/get-progress',
    '/actions/tracking/get-user-progress',
    '/actions/quiz/get-results',
    '/actions/quiz/results',
    '/actions/learning/progress',
    '/actions/nuxt-bridge/tracking',
    '/actions/app/tracking',
  ];
  for (const p of actionPaths) {
    try {
      const r = await httpGet(p);
      if (r.status !== 404 && r.status !== 405) {
        console.log(`  ${p} → HTTP ${r.status} | ${r.body.substring(0, 120)}`);
      } else {
        console.log(`  ${p} → ${r.status}`);
      }
    } catch(e) {
      console.log(`  ${p} → ERR: ${e.message}`);
    }
  }

  // ── Test 4: Try the Nuxt.js API routes (frontend may have its own API) ─────
  console.log('\n--- Test 4: Nuxt.js / frontend API routes ---');
  const nuxtPaths = [
    '/api/v1/tracking',
    '/api/v1/courses',
    '/api/v1/progress',
    '/api/v1/quiz',
    '/api/tracking/course-progress',
    '/api/tracking/quiz-results',
    '/tracking',
    '/tracking/courses',
    '/_nuxt/',
  ];
  for (const p of nuxtPaths) {
    try {
      const r = await httpGet(p);
      console.log(`  ${p} → HTTP ${r.status} | ${r.body.substring(0, 100)}`);
    } catch(e) {
      console.log(`  ${p} → ERR: ${e.message}`);
    }
  }

  // ── Test 5: Check if there are Craft user group definitions ───────────────
  console.log('\n--- Test 5: User group introspection via users query ---');
  // Try to use `group` arg to find what groups exist
  const groupNames = ['admin', 'editor', 'GROHE', 'installer', 'Installer', 'content', 'user'];
  for (const g of groupNames) {
    const r = await gql(`{ userCount(group: "${g}") }`);
    const count = r.data?.userCount ?? 'ERROR';
    if (count !== 'ERROR' && count !== null) {
      console.log(`  group="${g}": ${count} users`);
    }
  }

  // ── Test 6: Count users by status ─────────────────────────────────────────
  console.log('\n--- Test 6: User counts by status ---');
  const statuses = ['active', 'inactive', 'pending', 'suspended', 'locked'];
  for (const s of statuses) {
    const r = await gql(`{ userCount(status: "${s}") }`);
    console.log(`  status=${s}: ${r.data?.userCount ?? 'error'}`);
  }
  const rAll = await gql(`{ userCount(status: null) }`);
  console.log(`  status=null (all): ${rAll.data?.userCount ?? 'error'}`);

  // ── Test 7: Look for plugin-added types in full schema ─────────────────────
  console.log('\n--- Test 7: All non-standard schema types (potential plugins) ---');
  const r7 = await gql(`{
    __schema {
      types { name kind }
    }
  }`);
  const allTypes = r7.data?.__schema?.types || [];
  // Filter out built-in GraphQL types and known Craft types
  const custom = allTypes.filter(t =>
    t.name &&
    !t.name.startsWith('__') &&
    !['String','Int','Float','Boolean','ID','DateTime','QueryArgument'].includes(t.name) &&
    !/^(SCALAR|INTERFACE|UNION)$/.test(t.kind) &&
    /plugin|tracking|progress|quiz.?result|user.*cours|cours.*user|complet.*user|user.*complet|answer.*record|record.*answer|learning/i.test(t.name)
  );
  console.log('  Possible plugin-based tracking types:', custom.length > 0 ? custom.map(t => t.name).join(', ') : 'none found');

  // Print ALL types that don't look like standard Craft CMS/content types
  const allCustom = allTypes.filter(t =>
    t.name && !t.name.startsWith('__') &&
    !['String','Int','Float','Boolean','ID','DateTime','QueryArgument'].includes(t.name)
  );
  const trackingPattern = /track|progress|complet|result|answer|attempt|score|learn|quiz.*user|user.*quiz/i;
  const potentiallyTrackingRelated = allCustom.filter(t => trackingPattern.test(t.name));
  console.log('  All tracking-related type names:');
  potentiallyTrackingRelated.forEach(t => console.log('   -', t.name, '(', t.kind, ')'));

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
