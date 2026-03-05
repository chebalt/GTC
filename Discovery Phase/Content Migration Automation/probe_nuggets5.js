/**
 * READ-ONLY — Final: resolve nuggetInjector entry type + collect browsable URLs.
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
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function run() {
  console.log('=== READ-ONLY Nugget Probe 5 ===\n');

  // Query nuggets field using base EntryInterface fields directly (no inline fragments)
  console.log('--- Training: allure-gravity-design — nuggetInjector.nuggets base fields ---');
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
                  id title slug uri language siteHandle
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
    console.log('Training URL: https://training.grohe.com/' + t.uri);
    let injectorCount = 0;
    (t.contentBuilder || []).forEach(b => {
      if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
      (b.children || []).forEach(c => {
        if (c.__typename !== 'contentBuilder_nuggetInjector_BlockType') return;
        injectorCount++;
        (c.nuggets || []).forEach(n => {
          console.log(`  nugget: slug="${n.slug}" uri="${n.uri}" title="${n.title}"`);
          console.log(`    → https://training.grohe.com/${n.uri}`);
        });
      });
    });
    console.log('Total injector blocks:', injectorCount);
  }
  if (r1.errors) console.log('Errors:', r1.errors.map(e => e.message));

  // -- 3 different collections with trainings and their nugget URLs ----------
  console.log('\n--- 3 collections × their trainings × injected nugget URLs ---');
  const collections = ['allure-gravity', 'grohe-ceramics-basics', 'watersystems'];
  for (const colSlug of collections) {
    // Get trainings for this collection via globalTracking
    const rGt = await gql(`{
      globalSets(handle: "globalTracking") {
        ... on globalTracking_GlobalSet {
          courseData {
            __typename
            ... on courseData_collections_BlockType {
              collection { slug }
              stories { slug uri __typename }
            }
          }
        }
      }
    }`);
    const colData = (rGt.data?.globalSets?.[0]?.courseData || []).find(cd =>
      cd.__typename === 'courseData_collections_BlockType' &&
      cd.collection?.[0]?.slug === colSlug
    );
    if (!colData) { console.log(`\n[${colSlug}]: not found in globalTracking`); continue; }

    const trainingStories = (colData.stories || []).filter(s => s.__typename === 'trainings_trainings_Entry');
    console.log(`\n[${colSlug}] → ${trainingStories.length} trainings`);

    // For each training, get injected nuggets
    for (const ts of trainingStories.slice(0, 2)) {
      const rT = await gql(`{
        trainingsEntries(site: "enGB", slug: "${ts.slug}") {
          ... on trainings_trainings_Entry {
            slug title uri
            contentBuilder {
              __typename
              ... on contentBuilder_sectionModule_BlockType {
                children {
                  __typename
                  ... on contentBuilder_nuggetInjector_BlockType {
                    nuggets { id title slug uri }
                  }
                }
              }
            }
          }
        }
      }`);
      const tr = rT.data?.trainingsEntries?.[0];
      if (!tr) continue;
      const nuggets = [];
      (tr.contentBuilder || []).forEach(b => {
        if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
        (b.children || []).forEach(c => {
          if (c.__typename === 'contentBuilder_nuggetInjector_BlockType') {
            (c.nuggets || []).forEach(n => nuggets.push(n));
          }
        });
      });
      console.log(`  Training: "${tr.title}" → https://training.grohe.com/${tr.uri}`);
      if (nuggets.length > 0) {
        nuggets.slice(0, 4).forEach(n =>
          console.log(`    Nugget: "${n.title}" → https://training.grohe.com/${n.uri}`)
        );
        if (nuggets.length > 4) console.log(`    ... and ${nuggets.length - 4} more`);
      } else {
        console.log('    (no nuggetInjector — content embedded directly)');
      }
    }
  }

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
