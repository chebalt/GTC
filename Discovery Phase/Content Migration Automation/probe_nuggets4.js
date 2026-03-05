/**
 * READ-ONLY — Final: confirm nuggetInjector → lesson link, get browsable URLs.
 * NO mutations.
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

async function run() {
  console.log('=== READ-ONLY Nugget Probe 4: nuggetInjector confirmed ===\n');

  // ── Step 1: One training with nuggetInjector — full path ───────────────────
  const r1 = await gql(`{
    trainingsEntries(site: "enGB", slug: "allure-gravity-design") {
      ... on trainings_trainings_Entry {
        slug title uri
        contentBuilder {
          __typename
          ... on contentBuilder_sectionModule_BlockType {
            children {
              __typename
              ... on contentBuilder_nuggetInjector_BlockType {
                nuggets {
                  __typename
                  ... on lessons_lessons_Entry { id title slug uri }
                  ... on trainings_trainings_Entry { id title slug uri }
                }
              }
            }
          }
        }
      }
    }
  }`);

  const t = r1.data?.trainingsEntries?.[0];
  if (t) {
    console.log('Training:', t.title);
    console.log('Training URL: https://training.grohe.com/' + t.uri);
    console.log('Injected nuggets:');
    (t.contentBuilder || []).forEach(b => {
      if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
      (b.children || []).forEach(c => {
        if (c.__typename !== 'contentBuilder_nuggetInjector_BlockType') return;
        const n = c.nuggets;
        if (n) console.log('  -', (n.__typename || 'unknown').replace('_Entry',''), '| slug:', n.slug, '| URL: https://training.grohe.com/' + n.uri);
      });
    });
  }

  // ── Step 2: Find the watersystems training and its br1 nuggets ─────────────
  console.log('\n--- Watersystems collection trainings and their nuggets ---');
  const r2 = await gql(`{
    globalSets(handle: "globalTracking") {
      ... on globalTracking_GlobalSet {
        courseData {
          __typename
          ... on courseData_collections_BlockType {
            collection { slug title }
            stories { slug uri __typename }
          }
        }
      }
    }
  }`);
  const watersystems = (r2.data?.globalSets?.[0]?.courseData || []).find(cd =>
    cd.__typename === 'courseData_collections_BlockType' &&
    cd.collection?.[0]?.slug === 'watersystems'
  );
  if (watersystems) {
    console.log('Collection:', watersystems.collection?.[0]?.slug);
    console.log('Stories (trainings):');
    (watersystems.stories || []).forEach(s => console.log('  -', s.slug, '→ https://training.grohe.com/' + s.uri));
  }

  // ── Step 3: Drill into one watersystems training to find br1 nugget refs ───
  console.log('\n--- Drill into watersystems training for br1 nuggets ---');
  const wsTrainingSlug = watersystems?.stories?.[0]?.slug;
  if (wsTrainingSlug) {
    const r3 = await gql(`{
      trainingsEntries(site: "enGB", slug: "${wsTrainingSlug}") {
        ... on trainings_trainings_Entry {
          slug title uri
          contentBuilder {
            __typename
            ... on contentBuilder_sectionModule_BlockType {
              children {
                __typename
                ... on contentBuilder_nuggetInjector_BlockType {
                  nuggets {
                    __typename
                    ... on lessons_lessons_Entry { id title slug uri }
                    ... on trainings_trainings_Entry { id title slug uri }
                  }
                }
                ... on contentBuilder_entryLinksModule_BlockType {
                  entryLinks { id title slug uri __typename }
                }
              }
            }
          }
        }
      }
    }`);
    const wt = r3.data?.trainingsEntries?.[0];
    if (wt) {
      console.log('Training:', wt.title, '→ https://training.grohe.com/' + wt.uri);
      const nuggets = [];
      (wt.contentBuilder || []).forEach(b => {
        if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
        (b.children || []).forEach(c => {
          if (c.__typename === 'contentBuilder_nuggetInjector_BlockType' && c.nuggets) {
            nuggets.push(c.nuggets);
          }
        });
      });
      console.log('Injected nuggets:', nuggets.length);
      nuggets.forEach(n => console.log('  -', n.slug, '(' + n.__typename + ') → https://training.grohe.com/' + n.uri));
    }
  }

  // ── Step 4: Summary — collect 5 good browsable examples ───────────────────
  console.log('\n--- BROWSABLE EXAMPLES ---');
  console.log('Collection (training overview):');
  console.log('  https://training.grohe.com/collections/watersystems');
  console.log('  https://training.grohe.com/collections/allure-gravity');
  console.log('  https://training.grohe.com/collections/grohe-ceramics-basics');

  // Get the training URL from watersystems
  if (watersystems?.stories?.[0]) {
    console.log('\nTraining page (where nuggets are injected):');
    (watersystems.stories || []).slice(0,3).forEach(s =>
      console.log('  https://training.grohe.com/' + s.uri)
    );
  }

  // Standalone nugget pages
  console.log('\nNugget standalone pages (lessons/{slug}):');
  const r4 = await gql(`{
    lessonsEntries(site: "enGB", limit: 5) {
      ... on lessons_lessons_Entry { slug uri title }
    }
  }`);
  (r4.data?.lessonsEntries || []).forEach(l =>
    console.log('  https://training.grohe.com/' + l.uri + '  ← "' + l.title + '"')
  );

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
