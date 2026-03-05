/**
 * READ-ONLY — Probe nugget (lesson) usage patterns across collections.
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
  console.log('=== READ-ONLY Nugget Usage Probe ===\n');

  // ── Step 1: Sample lessons directly — check contentDependencies for nav context ─
  console.log('--- Step 1: Sample 10 lessons — contentDependencies & nuggetRelatedContent ---');
  const r1 = await gql(`{
    lessonsEntries(site: "enGB", limit: 10) {
      ... on lessons_lessons_Entry {
        id title slug uri language
        nuggetMetaInformation {
          ... on nuggetMetaInformation_BlockType { headline overline readingTime }
        }
        contentDependencies {
          ... on contentDependencies_BlockType {
            overview { id title slug uri __typename }
            nextChapter { id title slug uri __typename }
            previousChapter { id title slug uri __typename }
          }
        }
        nuggetRelatedContent { id title slug uri __typename }
        contentBuilder { __typename }
      }
    }
  }`);

  if (r1.errors) { console.log('ERROR:', r1.errors[0].message); return; }
  const lessons = r1.data?.lessonsEntries || [];
  lessons.forEach(l => {
    const deps = l.contentDependencies?.[0];
    const blocks = (l.contentBuilder || []).map(b => b.__typename.replace('contentBuilder_','').replace('_BlockType','')).join(', ');
    console.log(`\n  [${l.slug}]`);
    console.log(`    headline: "${l.nuggetMetaInformation?.[0]?.headline || '(none)'}"`);
    console.log(`    URL: training.grohe.com/${l.uri}`);
    console.log(`    overview: ${deps?.overview?.[0]?.slug || 'none'} (${deps?.overview?.[0]?.__typename || '-'})`);
    console.log(`    nextChapter: ${deps?.nextChapter?.[0]?.slug || 'none'} (${deps?.nextChapter?.[0]?.__typename || '-'})`);
    console.log(`    prevChapter: ${deps?.previousChapter?.[0]?.slug || 'none'} (${deps?.previousChapter?.[0]?.__typename || '-'})`);
    console.log(`    relatedNuggets: ${(l.nuggetRelatedContent || []).map(n => n.slug).join(', ') || 'none'}`);
    console.log(`    contentBlocks: ${blocks}`);
  });

  // ── Step 2: Find trainings that reference lesson entries ───────────────────
  console.log('\n\n--- Step 2: Find trainings whose globalTracking stories include lessons ---');
  const r2 = await gql(`{
    globalSets(handle: "globalTracking") {
      ... on globalTracking_GlobalSet {
        courseData {
          __typename
          ... on courseData_collections_BlockType {
            collection { slug }
            stories { id slug uri __typename }
          }
        }
      }
    }
  }`);

  const courseData = r2.data?.globalSets?.[0]?.courseData || [];
  const collectionsWithLessons = [];
  const collectionsWithTrainings = [];

  courseData.forEach(cd => {
    if (cd.__typename !== 'courseData_collections_BlockType') return;
    const slug = cd.collection?.[0]?.slug;
    const hasLessons = (cd.stories || []).some(s => s.__typename === 'lessons_lessons_Entry');
    const hasTrainings = (cd.stories || []).some(s => s.__typename === 'trainings_trainings_Entry');
    if (hasLessons) collectionsWithLessons.push({ slug, stories: cd.stories });
    else if (hasTrainings) collectionsWithTrainings.push(slug);
  });

  console.log(`  Collections using lessons as stories: ${collectionsWithLessons.length}`);
  console.log(`  Collections using trainings as stories: ${collectionsWithTrainings.length}`);

  if (collectionsWithLessons.length > 0) {
    console.log('\n  Collections with lesson stories (first 5):');
    collectionsWithLessons.slice(0, 5).forEach(c => {
      const lessonSlugs = c.stories.filter(s => s.__typename === 'lessons_lessons_Entry').map(s => s.slug);
      console.log(`    [${c.slug}] → lessons: ${lessonSlugs.slice(0,3).join(', ')}...`);
    });
  }

  // ── Step 3: Check nuggetInjector usage in lessons ──────────────────────────
  console.log('\n--- Step 3: Check for nuggetInjector blocks in lessons (first 50) ---');
  const r3 = await gql(`{
    lessonsEntries(site: "enGB", limit: 50) {
      ... on lessons_lessons_Entry {
        slug
        contentBuilder {
          __typename
          ... on contentBuilder_nuggetInjector_BlockType { id }
        }
      }
    }
  }`);
  const withInjector = (r3.data?.lessonsEntries || []).filter(l =>
    l.contentBuilder?.some(b => b.__typename === 'contentBuilder_nuggetInjector_BlockType')
  );
  console.log(`  Lessons with nuggetInjector: ${withInjector.length}`);
  withInjector.forEach(l => console.log(`    - ${l.slug}`));

  // ── Step 4: Check interactionRelatedNuggets on quiz interactions ───────────
  console.log('\n--- Step 4: Quiz interactions that reference nuggets ---');
  const r4 = await gql(`{
    quizInteractionsEntries(site: "enGB", limit: 50) {
      ... on quizInteractions_quizInteractions_Entry {
        slug title
        interactionRelatedNuggets { id title slug uri __typename }
      }
    }
  }`);
  const withNuggets = (r4.data?.quizInteractionsEntries || []).filter(q =>
    (q.interactionRelatedNuggets || []).length > 0
  );
  console.log(`  Quiz interactions referencing nuggets: ${withNuggets.length} (out of 50 sampled)`);
  withNuggets.slice(0, 5).forEach(q => {
    const nuggets = q.interactionRelatedNuggets.map(n => n.slug).join(', ');
    console.log(`    [${q.slug}] → ${nuggets}`);
  });

  // ── Step 5: For a collection with lessons — trace full path to nugget URLs ─
  if (collectionsWithLessons.length > 0) {
    const sample = collectionsWithLessons[0];
    const lessonStory = sample.stories.find(s => s.__typename === 'lessons_lessons_Entry');
    console.log(`\n--- Step 5: Full detail on one nugget from collection "${sample.slug}" ---`);
    const r5 = await gql(`{
      lessonsEntries(site: "enGB", slug: "${lessonStory.slug}") {
        ... on lessons_lessons_Entry {
          id uid title slug uri language
          nuggetMetaInformation {
            ... on nuggetMetaInformation_BlockType { headline overline subline readingTime }
          }
          contentDependencies {
            ... on contentDependencies_BlockType {
              overview { slug uri __typename }
              nextChapter { slug uri __typename }
              previousChapter { slug uri __typename }
            }
          }
          nuggetRelatedContent { slug uri __typename }
          contentBuilder { __typename }
        }
      }
    }`);
    const nugget = r5.data?.lessonsEntries?.[0];
    if (nugget) {
      const deps = nugget.contentDependencies?.[0];
      console.log(`  slug: ${nugget.slug}`);
      console.log(`  URL:  https://training.grohe.com/${nugget.uri}`);
      console.log(`  headline: "${nugget.nuggetMetaInformation?.[0]?.headline}"`);
      console.log(`  readingTime: ${nugget.nuggetMetaInformation?.[0]?.readingTime} min`);
      console.log(`  overview (back to training): ${deps?.overview?.[0]?.uri || 'none'}`);
      console.log(`  nextChapter: ${deps?.nextChapter?.[0]?.uri || 'none'}`);
      console.log(`  prevChapter: ${deps?.previousChapter?.[0]?.uri || 'none'}`);
      console.log(`  contentBlocks: ${nugget.contentBuilder?.map(b => b.__typename.replace('contentBuilder_','').replace('_BlockType','')).join(', ')}`);
    }
  }

  // ── Step 6: Get browsable URLs — 5 lessons across different collections ────
  console.log('\n--- Step 6: Browsable nugget URLs (sample across different collections) ---');
  const r6 = await gql(`{
    lessonsEntries(site: "enGB", limit: 200) {
      ... on lessons_lessons_Entry {
        slug uri
        contentDependencies {
          ... on contentDependencies_BlockType {
            overview { slug __typename }
          }
        }
      }
    }
  }`);
  // Group by "overview" (the training they belong to) and pick one per training
  const byTraining = {};
  (r6.data?.lessonsEntries || []).forEach(l => {
    const overview = l.contentDependencies?.[0]?.overview?.[0]?.slug || 'unknown';
    if (!byTraining[overview]) byTraining[overview] = l;
  });
  const sample6 = Object.values(byTraining).slice(0, 8);
  console.log('  One nugget URL per training (for browsing):');
  sample6.forEach(l => {
    console.log(`    https://training.grohe.com/${l.uri}`);
  });

  console.log('\n=== Done. All queries were READ-ONLY. ===');
}

run().catch(e => console.error('Fatal:', e));
