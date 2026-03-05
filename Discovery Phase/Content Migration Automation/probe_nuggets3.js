/**
 * READ-ONLY — Probe 3: Final nugget investigation.
 * - Check nuggetInjector in trainings
 * - Find BR1 collection and trace full content path
 * - Confirm what "nuggets/{slug}" pages actually look like
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

async function run() {
  console.log('=== READ-ONLY Nugget Probe 3: Final investigation ===\n');

  // ── Step 1: Find the collection that owns br1-* lessons ────────────────────
  console.log('--- Step 1: Find collection containing br1-* lessons ---');
  const r1 = await gql(`{
    coursesEntries(site: "enGB") {
      ... on courses_courses_Entry {
        slug title uri
      }
    }
  }`);
  const brCollections = (r1.data?.coursesEntries || []).filter(c =>
    c.slug.toLowerCase().includes('br1') || c.title.toLowerCase().includes('br1') || c.title.toLowerCase().includes('watersystem')
  );
  console.log('  BR1/Watersystems collections:');
  brCollections.forEach(c => console.log(`    [${c.slug}] "${c.title}" → https://training.grohe.com/${c.uri}`));

  if (brCollections.length === 0) {
    console.log('  No br1 collections — listing all collection slugs:');
    (r1.data?.coursesEntries || []).forEach(c => console.log(`    ${c.slug}`));
  }

  // ── Step 2: Check trainings for nuggetInjector blocks ─────────────────────
  console.log('\n--- Step 2: Do any trainings use nuggetInjector? (all 305) ---');
  const r2 = await gql(`{
    trainingsEntries(site: "enGB", limit: 305) {
      ... on trainings_trainings_Entry {
        slug
        contentBuilder {
          __typename
          ... on contentBuilder_sectionModule_BlockType {
            children {
              __typename
              ... on contentBuilder_nuggetInjector_BlockType {
                id
              }
            }
          }
        }
      }
    }
  }`);
  const withInjector = (r2.data?.trainingsEntries || []).filter(t =>
    t.contentBuilder?.some(b =>
      b.__typename === 'contentBuilder_sectionModule_BlockType' &&
      b.children?.some(c => c.__typename === 'contentBuilder_nuggetInjector_BlockType')
    )
  );
  console.log(`  Trainings with nuggetInjector: ${withInjector.length} / ${r2.data?.trainingsEntries?.length}`);
  withInjector.slice(0, 5).forEach(t => console.log(`    - ${t.slug}`));

  // ── Step 3: Check the actual sectionModule children types across all trainings ─
  console.log('\n--- Step 3: All child block types found inside sectionModules (trainings) ---');
  const childTypes = {};
  (r2.data?.trainingsEntries || []).forEach(t => {
    (t.contentBuilder || []).forEach(b => {
      if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
      (b.children || []).forEach(c => {
        childTypes[c.__typename] = (childTypes[c.__typename] || 0) + 1;
      });
    });
  });
  Object.entries(childTypes).sort((a,b) => b[1]-a[1]).forEach(([k, v]) => {
    console.log(`  ${k.replace('contentBuilder_','').replace('_BlockType','')}: ${v}`);
  });

  // ── Step 4: Get the actual lesson page content for a br1 nugget ────────────
  console.log('\n--- Step 4: Full content of a br1 lesson (nugget) ---');
  const r4 = await gql(`{
    lessonsEntries(site: "enGB", slug: "br1-drinking-bottles-carafes") {
      ... on lessons_lessons_Entry {
        id title slug uri
        nuggetMetaInformation {
          ... on nuggetMetaInformation_BlockType {
            headline overline subline readingTime
          }
        }
        contentDependencies {
          ... on contentDependencies_BlockType {
            overview { id slug uri __typename }
            nextChapter { id slug uri __typename }
            previousChapter { id slug uri __typename }
          }
        }
        nuggetRelatedContent { id slug uri __typename }
        contentBuilder {
          __typename id
          ... on contentBuilder_multicolumnModule_BlockType {
            children {
              __typename
              ... on contentBuilder_column_BlockType {
                children {
                  __typename
                  ... on contentBuilder_nestedTextComponent_BlockType { textComponent }
                  ... on contentBuilder_nestedImageComponent_BlockType {
                    imageComponent { url alt title }
                  }
                }
              }
            }
          }
          ... on contentBuilder_textMediaModule_BlockType {
            textComponent
            children {
              __typename
              ... on contentBuilder_nestedImageComponent_BlockType {
                imageComponent { url alt }
              }
            }
          }
        }
      }
    }
  }`);
  const lesson = r4.data?.lessonsEntries?.[0];
  if (lesson) {
    const meta = lesson.nuggetMetaInformation?.[0];
    const deps = lesson.contentDependencies?.[0];
    console.log(`  title: "${lesson.title}"`);
    console.log(`  URL: https://training.grohe.com/${lesson.uri}`);
    console.log(`  headline: "${meta?.headline}" | overline: "${meta?.overline}" | readingTime: ${meta?.readingTime}min`);
    console.log(`  contentDependencies.overview: ${deps?.overview?.[0]?.uri || 'NONE'} (${deps?.overview?.[0]?.__typename || '-'})`);
    console.log(`  contentDependencies.next: ${deps?.nextChapter?.[0]?.uri || 'NONE'}`);
    console.log(`  contentDependencies.prev: ${deps?.previousChapter?.[0]?.uri || 'NONE'}`);
    console.log(`  relatedContent: ${lesson.nuggetRelatedContent?.map(n => n.uri).join(', ') || 'none'}`);
    console.log(`  contentBlocks: ${lesson.contentBuilder?.map(b => b.__typename.replace('contentBuilder_','').replace('_BlockType','')).join(', ')}`);
    // Show first text snippet
    const mc = lesson.contentBuilder?.find(b => b.__typename === 'contentBuilder_multicolumnModule_BlockType');
    const firstText = mc?.children?.[0]?.children?.find(c => c.__typename === 'contentBuilder_nestedTextComponent_BlockType');
    if (firstText?.textComponent) {
      console.log(`  first text: "${firstText.textComponent.replace(/<[^>]+>/g,'').substring(0,100)}"`);
    }
  } else {
    console.log('  Lesson not found by slug — trying lessonsEntries with limit');
    const r4b = await gql(`{ lessonsEntries(site: "enGB", limit: 5) { slug uri } }`);
    console.log('  Available lesson slugs:', r4b.data?.lessonsEntries?.map(l => l.slug + ' → ' + l.uri));
  }

  // ── Step 5: Check if trainings reference lessons via relatedTo ────────────
  console.log('\n--- Step 5: Query a training by relatedToEntries (lessons) ---');
  // Use relatedToEntries to find trainings related to a specific lesson
  const r5 = await gql(`{
    trainingsEntries(
      site: "enGB"
      relatedToEntries: [{ section: "lessons" }]
      limit: 5
    ) {
      ... on trainings_trainings_Entry {
        slug title uri
      }
    }
  }`);
  if (r5.errors) {
    console.log('  Error:', r5.errors[0]?.message?.substring(0, 100));
  } else {
    const related = r5.data?.trainingsEntries || [];
    console.log(`  Trainings related to any lesson: ${related.length}`);
    related.forEach(t => console.log(`    ${t.slug} → https://training.grohe.com/${t.uri}`));
  }

  // ── Step 6: Find what entries are related to a specific lesson ─────────────
  console.log('\n--- Step 6: What entries reference br1-drinking-bottles-carafes? ---');
  const r6 = await gql(`{
    entries(
      site: "enGB"
      relatedTo: [{ section: "lessons", slug: "br1-drinking-bottles-carafes" }]
      limit: 10
    ) {
      id title slug uri __typename
    }
  }`);
  if (r6.errors) {
    console.log('  Error:', r6.errors[0]?.message?.substring(0, 100));
  } else {
    const related = r6.data?.entries || [];
    console.log(`  Entries referencing br1-drinking-bottles-carafes: ${related.length}`);
    related.forEach(e => console.log(`    [${e.__typename}] ${e.slug} → ${e.uri}`));
  }

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
