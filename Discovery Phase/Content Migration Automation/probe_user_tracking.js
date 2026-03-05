/**
 * READ-ONLY — Probe user/tracking data accessibility via GraphQL.
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

// Generic REST GET helper
function restGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://lc.training.grohe.this.work' + path);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 500) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== READ-ONLY User/Tracking Data Probe ===\n');

  // ── Test 1: Can we query users at all? ───────────────────────────────────
  console.log('--- Test 1: Query users (basic fields) ---');
  const r1 = await gql(`{
    userCount
    users(limit: 3) {
      id uid username email firstName lastName
      status dateCreated dateUpdated
      market accessgroup userEmail
    }
  }`);
  if (r1.errors) {
    console.log('  Errors:', r1.errors.map(e => e.message).join('\n  '));
  } else {
    console.log('  User count:', r1.data?.userCount);
    const users = r1.data?.users || [];
    console.log('  Users returned:', users.length);
    users.forEach(u => {
      console.log('   -', u.id, '|', u.username || '(no username)', '|', u.email || '(no email)',
        '| market:', u.market, '| group:', u.accessgroup);
    });
  }

  // ── Test 2: Inspect completedCoursesModule fields ─────────────────────────
  console.log('\n--- Test 2: Introspect completedCoursesModule block type ---');
  const r2 = await gql(`{
    __type(name: "contentBuilder_completedCoursesModule_BlockType") {
      name
      fields { name description type { name kind ofType { name kind } } }
    }
  }`);
  if (r2.errors) {
    console.log('  Errors:', r2.errors.map(e => e.message).join('\n  '));
  } else {
    const t = r2.data?.__type;
    console.log('  Type:', t?.name);
    console.log('  Fields:');
    (t?.fields || []).forEach(f => {
      const typeName = f.type?.name || f.type?.ofType?.name || '?';
      console.log('   -', f.name, ':', typeName);
    });
  }

  // ── Test 3: Check globalTracking for user-specific data ──────────────────
  console.log('\n--- Test 3: Inspect globalTracking GlobalSet type ---');
  const r3 = await gql(`{
    __type(name: "globalTracking_GlobalSet") {
      fields { name type { name kind ofType { name } } }
    }
  }`);
  const fields = r3.data?.__type?.fields || [];
  console.log('  globalTracking_GlobalSet fields:');
  fields.forEach(f => console.log('   -', f.name, ':', f.type?.name || f.type?.ofType?.name || f.type?.kind));

  // ── Test 4: Live query globalTracking full data ───────────────────────────
  console.log('\n--- Test 4: Live globalTracking data (full courseData) ---');
  const r4 = await gql(`{
    globalSets(handle: "globalTracking") {
      ... on globalTracking_GlobalSet {
        courseData {
          __typename
          ... on courseData_collections_BlockType {
            collection { id title slug }
            stories { id title slug __typename }
          }
          ... on courseData_compactTrainings_BlockType {
            compactTraining { id title slug }
          }
        }
      }
    }
  }`);
  if (r4.errors) {
    console.log('  Errors:', r4.errors.map(e => e.message).join('\n  '));
  } else {
    const courseData = r4.data?.globalSets?.[0]?.courseData || [];
    const collections = courseData.filter(d => d.__typename === 'courseData_collections_BlockType');
    const compact = courseData.filter(d => d.__typename === 'courseData_compactTrainings_BlockType');
    console.log('  Total courseData entries:', courseData.length);
    console.log('  Collections (with required stories):', collections.length);
    console.log('  Compact Trainings:', compact.length);
    if (collections.length > 0) {
      const sample = collections[0];
      console.log('  Sample collection:', sample.collection?.[0]?.slug,
        '| required stories:', sample.stories?.length);
      sample.stories?.slice(0, 3).forEach(s => console.log('    -', s.slug, '(', s.__typename, ')'));
    }
  }

  // ── Test 5: Look for non-GraphQL REST endpoints (tracking/progress APIs) ──
  console.log('\n--- Test 5: Probe known REST API patterns ---');
  const paths = [
    '/api/tracking',
    '/api/progress',
    '/api/user-progress',
    '/api/completions',
    '/api/quiz-results',
    '/api/v1/tracking',
    '/api/v1/user',
    '/actions/tracking',
    '/actions/users/progress',
    '/index.php?action=app/tracking',
    '/',
  ];
  for (const p of paths) {
    try {
      const r = await restGet(p);
      if (r.status !== 404) {
        console.log('  ' + p + ' → HTTP ' + r.status + ' | body:', r.body.substring(0, 100));
      } else {
        console.log('  ' + p + ' → 404');
      }
    } catch(e) {
      console.log('  ' + p + ' → ERROR:', e.message);
    }
  }

  // ── Test 6: Check if `preferences` field on User holds tracking data ──────
  console.log('\n--- Test 6: User preferences field (may contain progress JSON) ---');
  const r6 = await gql(`{
    users(limit: 5, status: null) {
      id uid email status
      preferences
      market accessgroup
    }
  }`);
  if (r6.errors) {
    console.log('  Errors:', r6.errors.map(e => e.message).join('\n  '));
  } else {
    const users = r6.data?.users || [];
    console.log('  Users with status=null:', users.length);
    users.forEach(u => {
      const prefs = u.preferences ? u.preferences.substring(0, 100) : '(null)';
      console.log('   - uid:', u.uid, '| market:', u.market, '| group:', u.accessgroup);
      console.log('     preferences:', prefs);
    });
  }

  // ── Test 7: Check for any plugin-specific query types we may have missed ──
  console.log('\n--- Test 7: All schema types containing progress/track/quiz-result ---');
  const r7 = await gql(`{
    __schema {
      types {
        name
        kind
      }
    }
  }`);
  const allTypes = r7.data?.__schema?.types || [];
  const interesting = allTypes.filter(t =>
    /track|progress|complet|quiz.?result|quiz.?answer|user.?cours|cours.?user|attempt|score.*user|user.*score/i.test(t.name || '')
  );
  console.log('  Potentially relevant types:');
  interesting.forEach(t => console.log('   -', t.name, '(', t.kind, ')'));

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
