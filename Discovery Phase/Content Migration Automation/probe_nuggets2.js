/**
 * READ-ONLY — Probe 2: Find trainings that contain lesson/nugget references
 * and get browsable URLs.
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
  console.log('=== READ-ONLY Nugget Probe 2: Training → Lesson references ===\n');

  // ── Step 1: Find trainings that contain entryLinksModule in sectionModule ──
  // entryLinksModule is how nuggets are embedded/listed inside a training page
  console.log('--- Step 1: Query BR1 trainings (br1-* slugs contain nugget refs) ---');
  const r1 = await gql(`{
    trainingsEntries(site: "enGB", slug: ["br1-water-filtration", "br1-product-range", "br1-kitchen-systems", "br1-introduction"]) {
      ... on trainings_trainings_Entry {
        id title slug uri
        contentBuilder {
          __typename id
          ... on contentBuilder_sectionModule_BlockType {
            children {
              __typename
              ... on contentBuilder_entryLinksModule_BlockType {
                entryLinks { id title slug uri __typename }
                entryLinksType extendedEntryList
              }
              ... on contentBuilder_nextChapterModule_BlockType {
                singlePlaylist { id title slug uri }
                singleCollection { id title slug uri }
              }
            }
          }
        }
      }
    }
  }`);

  const t1 = r1.data?.trainingsEntries || [];
  console.log('  Found:', t1.length, 'br1 trainings');

  // ── Step 2: Search more broadly — find ALL trainings, look for ones with entryLinks to lessons ─
  console.log('\n--- Step 2: Find trainings with entryLinksModule → lessons (first 50 trainings) ---');
  const r2 = await gql(`{
    trainingsEntries(site: "enGB", limit: 50) {
      ... on trainings_trainings_Entry {
        slug title
        contentBuilder {
          __typename
          ... on contentBuilder_sectionModule_BlockType {
            children {
              __typename
              ... on contentBuilder_entryLinksModule_BlockType {
                entryLinks { id title slug uri __typename }
              }
            }
          }
        }
      }
    }
  }`);

  const trainingsWithLessonLinks = [];
  (r2.data?.trainingsEntries || []).forEach(t => {
    const lessonLinks = [];
    (t.contentBuilder || []).forEach(b => {
      if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
      (b.children || []).forEach(c => {
        if (c.__typename !== 'contentBuilder_entryLinksModule_BlockType') return;
        (c.entryLinks || []).forEach(e => {
          if (e.__typename === 'lessons_lessons_Entry') lessonLinks.push(e);
        });
      });
    });
    if (lessonLinks.length > 0) {
      trainingsWithLessonLinks.push({ training: t.slug, title: t.title, lessons: lessonLinks });
    }
  });

  console.log(`  Trainings with lesson entryLinks: ${trainingsWithLessonLinks.length} out of 50`);
  trainingsWithLessonLinks.slice(0, 5).forEach(t => {
    console.log(`\n  Training: "${t.title}" [${t.training}]`);
    t.lessons.forEach(l => console.log(`    → lesson: ${l.slug} (${l.uri})`));
  });

  // ── Step 3: Check the watersystems training (has nuggets prefixed br1-/watersystems-) ──
  console.log('\n--- Step 3: Probe the watersystems collection specifically ---');
  const r3 = await gql(`{
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
  const wsCollection = (r3.data?.globalSets?.[0]?.courseData || []).find(cd =>
    cd.__typename === 'courseData_collections_BlockType' &&
    cd.collection?.[0]?.slug?.includes('water')
  );
  if (wsCollection) {
    console.log('  Watersystems collection:', wsCollection.collection?.[0]?.slug);
    console.log('  Stories:', wsCollection.stories?.map(s => s.slug + ' (' + s.__typename + ')'));
  } else {
    console.log('  No watersystems collection found — listing all collection slugs with their story types:');
    (r3.data?.globalSets?.[0]?.courseData || [])
      .filter(cd => cd.__typename === 'courseData_collections_BlockType')
      .slice(0, 10)
      .forEach(cd => {
        const types = [...new Set((cd.stories || []).map(s => s.__typename.replace('_Entry','')))];
        console.log(`  [${cd.collection?.[0]?.slug}] → ${types.join(', ')}`);
      });
  }

  // ── Step 4: How do nuggets appear inside a training? Check the actual sectionModule ──
  // The ceramics training had content directly in sectionModules. Try a "br1" training.
  console.log('\n--- Step 4: Deep dive into one training that should have nuggets ---');
  // br1 nuggets exist, find their parent training via slug pattern
  const r4 = await gql(`{
    trainingsEntries(site: "enGB", limit: 100) {
      ... on trainings_trainings_Entry {
        slug title
        contentBuilder {
          __typename
          ... on contentBuilder_sectionModule_BlockType {
            children {
              __typename
              ... on contentBuilder_entryLinksModule_BlockType {
                entryLinksType
                entryLinks { slug __typename }
              }
              ... on contentBuilder_nextChapterModule_BlockType {
                singlePlaylist { slug }
              }
            }
          }
          ... on contentBuilder_nextChapterModule_BlockType {
            singlePlaylist { slug }
          }
          ... on contentBuilder_feedbackLayerModule_BlockType { id }
        }
      }
    }
  }`);

  const allTrainings = r4.data?.trainingsEntries || [];
  const withLessons = allTrainings.filter(t =>
    t.contentBuilder?.some(b =>
      b.__typename === 'contentBuilder_sectionModule_BlockType' &&
      b.children?.some(c =>
        c.__typename === 'contentBuilder_entryLinksModule_BlockType' &&
        c.entryLinks?.some(e => e.__typename === 'lessons_lessons_Entry')
      )
    )
  );
  console.log(`  Trainings with lesson refs (of ${allTrainings.length} sampled): ${withLessons.length}`);
  withLessons.slice(0, 5).forEach(t => {
    console.log(`\n  [${t.slug}]`);
    t.contentBuilder?.forEach(b => {
      if (b.__typename !== 'contentBuilder_sectionModule_BlockType') return;
      b.children?.forEach(c => {
        if (c.__typename !== 'contentBuilder_entryLinksModule_BlockType') return;
        const lessons = (c.entryLinks || []).filter(e => e.__typename === 'lessons_lessons_Entry');
        if (lessons.length) console.log(`    entryLinks (${c.entryLinksType}): ${lessons.map(l => l.slug).join(', ')}`);
      });
    });
  });

  // ── Step 5: Check quiz interaction → nugget "aqua-tiles" ──────────────────
  console.log('\n--- Step 5: Find the "aqua-tiles" nugget (referenced by quiz interactions) ---');
  const r5 = await gql(`{
    lessonsEntries(site: "enGB", slug: "aqua-tiles") {
      ... on lessons_lessons_Entry {
        id title slug uri language
        nuggetMetaInformation {
          ... on nuggetMetaInformation_BlockType { headline overline readingTime }
        }
        contentDependencies {
          ... on contentDependencies_BlockType {
            overview { slug uri __typename }
            nextChapter { slug uri __typename }
            previousChapter { slug uri __typename }
          }
        }
        contentBuilder { __typename }
      }
    }
  }`);
  const aquaTiles = r5.data?.lessonsEntries?.[0];
  if (aquaTiles) {
    const deps = aquaTiles.contentDependencies?.[0];
    console.log(`  Found: "${aquaTiles.title}"`);
    console.log(`  URL: https://training.grohe.com/${aquaTiles.uri}`);
    console.log(`  overview: ${deps?.overview?.[0]?.uri || 'none'}`);
    console.log(`  contentBlocks: ${aquaTiles.contentBuilder?.map(b => b.__typename.replace('contentBuilder_','').replace('_BlockType','')).join(', ')}`);
  }

  // ── Step 6: Get ALL interactionRelatedNuggets across all quiz interactions ─
  console.log('\n--- Step 6: All quiz interactions → nugget refs (full 371) ---');
  const r6 = await gql(`{
    quizInteractionsEntries(site: "enGB", limit: 371) {
      ... on quizInteractions_quizInteractions_Entry {
        slug
        interactionRelatedNuggets { slug uri __typename }
      }
    }
  }`);
  const allInteractions = r6.data?.quizInteractionsEntries || [];
  const withNuggetRefs = allInteractions.filter(q => (q.interactionRelatedNuggets || []).length > 0);
  // Unique nuggets referenced
  const uniqueNuggets = new Map();
  withNuggetRefs.forEach(q => {
    (q.interactionRelatedNuggets || []).forEach(n => {
      if (!uniqueNuggets.has(n.slug)) uniqueNuggets.set(n.slug, n.uri);
    });
  });
  console.log(`  Quiz interactions with nugget refs: ${withNuggetRefs.length} / ${allInteractions.length}`);
  console.log(`  Unique nuggets referenced from quiz interactions: ${uniqueNuggets.size}`);
  console.log('  Nugget URLs (browsable):');
  [...uniqueNuggets.entries()].slice(0, 10).forEach(([slug, uri]) => {
    console.log(`    https://training.grohe.com/${uri}`);
  });

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
