#!/usr/bin/env node
/**
 * Export all GTC content from Craft CMS GraphQL API.
 * Saves raw data to craft-export.json for offline use.
 *
 * Run: node export-craft-data.js
 */

const fs = require('fs');
const path = require('path');

const CRAFT_API = 'https://lc.training.grohe.this.work/api';
const CRAFT_TOKEN = 'atY-GV3UKeDqcYOipuCbfgCqBtp_Dd5b';
const OUT_FILE = path.join(__dirname, 'craft-export.json');

async function craftQuery(query, variables = {}) {
  const resp = await fetch(CRAFT_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRAFT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await resp.json();
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

const COLLECTIONS_QUERY = `
{
  coursesEntries(limit: 200) {
    ... on courses_courses_Entry {
      id uid title slug uri
      colorTheme productlineTheme
      isLandingpage topic
      taxonomy {
        ... on taxonomy_BlockType {
          mainCategories { id title slug }
          tags { id title slug }
        }
      }
      stage {
        ... on stage_BlockType {
          overline headline subline
        }
      }
      collectionData {
        ... on collectionData_BlockType {
          heroText isHero
        }
      }
    }
  }
}`;

const TRAININGS_QUERY = `
query($slugs: [String]) {
  trainingsEntries(slug: $slugs, limit: 500) {
    ... on trainings_trainings_Entry {
      id uid title slug uri
      colorTheme productlineTheme
      trainingActivity topic
      taxonomy {
        ... on taxonomy_BlockType {
          mainCategories { id title slug }
        }
      }
      stage {
        ... on stage_BlockType {
          overline headline subline
        }
      }
      playlistMetaInformation {
        ... on playlistMetaInformation_BlockType {
          readingTime
        }
      }
      contentDependencies {
        ... on contentDependencies_BlockType {
          overview { slug }
          nextChapter { slug }
          previousChapter { slug }
        }
      }
    }
  }
}`;

const QUIZZES_QUERY = `
{
  quizzesEntries(limit: 200) {
    ... on quizzes_quizzes_Entry {
      id uid title slug uri
      colorTheme productlineTheme
      trainingActivity
      taxonomy {
        ... on taxonomy_BlockType {
          mainCategories { id title slug }
        }
      }
      quizMetaInformation {
        ... on quizMetaInformation_BlockType {
          overline headline subline text
          passingScore numberOfInteractions
          shuffleInteractions enableFeedback
        }
      }
      positiveFeedback {
        ... on positiveFeedback_BlockType {
          feedbackHeadline feedbackText
        }
      }
      negativeFeedback {
        ... on negativeFeedback_BlockType {
          feedbackHeadline feedbackText
        }
      }
      correspondingTraining { slug }
      interactions { id uid title slug }
    }
  }
}`;

const INTERACTIONS_QUERY = `
query($slugs: [String]) {
  quizInteractionsEntries(slug: $slugs, limit: 500) {
    ... on quizInteractions_quizInteractions_Entry {
      id uid title slug
      interactionMetaInformation {
        ... on interactionMetaInformation_BlockType {
          headline
        }
      }
      interactionBuilder {
        __typename
        ... on interactionBuilder_choiceModule_BlockType {
          questionOverline question questionInstruction
          forceMultipleChoice disableShuffle stacked
          choiceAnswerOptions {
            answerText correctAnswer
          }
          positiveFeedback { feedbackHeadline feedbackText }
          negativeFeedback { feedbackHeadline feedbackText }
          solutionFeedback { feedbackHeadline feedbackText }
        }
        ... on interactionBuilder_trueFalseModule_BlockType {
          questionOverline question questionInstruction
          stacked
          trueFalseAnswerOptions {
            trueLabel falseLabel correctAnswer
          }
          positiveFeedback { feedbackHeadline feedbackText }
          negativeFeedback { feedbackHeadline feedbackText }
          solutionFeedback { feedbackHeadline feedbackText }
        }
        ... on interactionBuilder_valueSliderModule_BlockType {
          questionOverline question questionInstruction
          stacked
          valueSliderConfiguration {
            minValue maxValue steps initialValue
            correctValue correctThreshold
            minLabel maxLabel currentValueLabel
          }
          positiveFeedback { feedbackHeadline feedbackText }
          negativeFeedback { feedbackHeadline feedbackText }
          solutionFeedback { feedbackHeadline feedbackText }
        }
        ... on interactionBuilder_DragDropModule_BlockType {
          questionOverline question questionInstruction
          disableShuffle stacked
          dragDrop {
            drag {
              __typename
              ... on drag_dragDropText_BlockType { textComponent }
              ... on drag_dragDropImage_BlockType { imageComponent { url alt } }
            }
            drop {
              __typename
              ... on drop_dropText_BlockType { textComponent }
              ... on drop_dropImage_BlockType { imageComponent { url alt } }
            }
          }
          positiveFeedback { feedbackHeadline feedbackText }
          negativeFeedback { feedbackHeadline feedbackText }
          solutionFeedback { feedbackHeadline feedbackText }
        }
        ... on interactionBuilder_fillTheBlankModule_BlockType {
          questionOverline question questionInstruction
          textWithoutFormating
          stacked
          positiveFeedback { feedbackHeadline feedbackText }
          negativeFeedback { feedbackHeadline feedbackText }
          solutionFeedback { feedbackHeadline feedbackText }
        }
        ... on interactionBuilder_sortableRankingListModule_BlockType {
          questionOverline question questionInstruction
          stacked
          sortableAnswerItems { item }
          positiveFeedback { feedbackHeadline feedbackText }
          negativeFeedback { feedbackHeadline feedbackText }
          solutionFeedback { feedbackHeadline feedbackText }
        }
      }
    }
  }
}`;

const GLOBAL_TRACKING_QUERY = `
{
  globalSets(handle: "globalTracking") {
    ... on globalTracking_GlobalSet {
      courseData {
        __typename
        ... on courseData_collections_BlockType {
          collection { slug }
          stories { slug __typename }
        }
        ... on courseData_compactTrainings_BlockType {
          compactTraining { slug }
        }
      }
    }
  }
}`;

async function main() {
  console.log('Exporting GTC content from Craft CMS...\n');

  // 1. Collections
  console.log('  Fetching collections...');
  const collectionsData = await craftQuery(COLLECTIONS_QUERY);
  const collections = collectionsData.coursesEntries;
  console.log(`    ${collections.length} collections`);

  // 2. Quizzes
  console.log('  Fetching quizzes...');
  const quizzesData = await craftQuery(QUIZZES_QUERY);
  const quizzes = quizzesData.quizzesEntries;
  console.log(`    ${quizzes.length} quizzes`);

  // 3. Global tracking
  console.log('  Fetching global tracking...');
  const trackingData = await craftQuery(GLOBAL_TRACKING_QUERY);
  const globalTracking = trackingData.globalSets[0];

  // Collect all training slugs from tracking + contentDependencies references
  const allTrainingSlugs = new Set();
  for (const item of globalTracking.courseData) {
    if (item.stories) {
      for (const s of item.stories) {
        // Only add if it's a training entry (not a quiz)
        if (s.__typename === 'trainings_trainings_Entry') {
          allTrainingSlugs.add(s.slug);
        }
      }
    }
  }

  // 4. Trainings (in batches)
  console.log('  Fetching trainings...');
  const slugArray = [...allTrainingSlugs];
  let allTrainings = [];
  const BATCH_SIZE = 50;
  for (let i = 0; i < slugArray.length; i += BATCH_SIZE) {
    const batch = slugArray.slice(i, i + BATCH_SIZE);
    const data = await craftQuery(TRAININGS_QUERY, { slugs: batch });
    allTrainings = allTrainings.concat(data.trainingsEntries || []);
    process.stdout.write(`    ${allTrainings.length} trainings fetched...\r`);
  }
  console.log(`    ${allTrainings.length} trainings                `);

  // 5. Interactions (quiz questions) — in batches
  console.log('  Fetching interactions...');
  const allInteractionSlugs = [];
  for (const q of quizzes) {
    if (q.interactions) {
      for (const i of q.interactions) {
        allInteractionSlugs.push(i.slug);
      }
    }
  }
  let allInteractions = [];
  for (let i = 0; i < allInteractionSlugs.length; i += BATCH_SIZE) {
    const batch = allInteractionSlugs.slice(i, i + BATCH_SIZE);
    const data = await craftQuery(INTERACTIONS_QUERY, { slugs: batch });
    allInteractions = allInteractions.concat(data.quizInteractionsEntries || []);
    process.stdout.write(`    ${allInteractions.length} interactions fetched...\r`);
  }
  console.log(`    ${allInteractions.length} interactions              `);

  // 6. Save
  const exportData = {
    _exportedAt: new Date().toISOString(),
    _source: CRAFT_API,
    collections,
    trainings: allTrainings,
    quizzes,
    interactions: allInteractions,
    globalTracking,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(exportData, null, 2), 'utf8');

  const sizeMB = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\nExported to: ${OUT_FILE} (${sizeMB} MB)`);
  console.log(`  Collections:   ${collections.length}`);
  console.log(`  Trainings:     ${allTrainings.length}`);
  console.log(`  Quizzes:       ${quizzes.length}`);
  console.log(`  Interactions:  ${allInteractions.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
