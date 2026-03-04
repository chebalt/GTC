/**
 * Full export of the "grohe-ceramics-basics" collection from Craft CMS.
 * READ-ONLY. No mutations.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const ENDPOINT = 'https://lc.training.grohe.this.work/api';
const TOKEN = 'atY-GV3UKeDqcYOipuCbfgCqBtp_Dd5b';
const OUT_DIR = path.join('C:/projects/GTC/Discovery Phase/Content Migration Automation/export_example');

// ── Asset fragment ────────────────────────────────────────────────────────────
const ASSET_FIELDS = `
  id uid title filename extension url mimeType size width height alt
  hasFocalPoint focalPoint kind dateCreated dateUpdated
`;

// ── Heading / button sub-fragments (reused) ───────────────────────────────────
const OPTIONAL_HEADING = `
  optionalHeading {
    ... on optionalHeading_headingBlock_BlockType {
      overline headline subline textAlignment
    }
  }
`;

const BUTTON_COMPONENT = `
  buttonComponent {
    __typename
    ... on buttonComponent_linkButton_BlockType { label icon buttonLink { url label } }
    ... on buttonComponent_simpleOverlay_BlockType { label icon headline text }
    ... on buttonComponent_complexOverlay_BlockType { label icon entry { id title slug uri } }
    ... on buttonComponent_soundButton_BlockType { label soundFile { ${ASSET_FIELDS} } }
  }
`;

const BACKGROUND_SETTINGS = `
  backgroundSettings {
    ... on backgroundSettings_BlockType {
      backgroundImage { ${ASSET_FIELDS} }
      backgroundPosition
    }
  }
`;

const SPACING_SETTINGS = `
  spacingSettings {
    ... on spacingSettings_BlockType { marginTop paddingTop paddingBottom }
  }
`;

// ── Nested components (inside textMedia, column, slide, etc.) ─────────────────
const NESTED_COMPONENTS = `
  children {
    __typename
    ... on contentBuilder_nestedImageComponent_BlockType {
      imageComponent { ${ASSET_FIELDS} }
      captionPosition infoTextPosition
    }
    ... on contentBuilder_nestedVideoComponent_BlockType {
      videoComponent { ${ASSET_FIELDS} }
      videoSettings {
        ... on videoSettings_BlockType { videoCta controls autoplay loop muted }
      }
      captionPosition
    }
    ... on contentBuilder_nestedTextComponent_BlockType { textComponent }
    ... on contentBuilder_nestedHeadingComponent_BlockType {
      headingComponentWithoutAlignment {
        ... on headingComponentWithoutAlignment_BlockType { overline headline subline }
      }
    }
    ... on contentBuilder_nestedLinkButtonComponent_BlockType {
      linkButtonComponentStatic {
        ... on linkButtonComponentStatic_BlockType { label icon }
      }
    }
    ... on contentBuilder_nestedSoundButtonComponent_BlockType {
      soundButtonComponentStatic {
        ... on soundButtonComponentStatic_BlockType { label soundFile { ${ASSET_FIELDS} } }
      }
    }
    ... on contentBuilder_nestedSimpleOverlayButtonComponent_BlockType { textComponent }
    ... on contentBuilder_nestedComplexOverlayButtonComponent_BlockType {
      complexOverlayButtonComponentStatic {
        ... on complexOverlayButtonComponentStatic_BlockType { label icon entry { id title slug } }
      }
    }
  }
`;

// ── Individual content block fragments ────────────────────────────────────────
const BLOCK_TEXT_MODULE = `
  ... on contentBuilder_textModule_BlockType {
    ${OPTIONAL_HEADING}
    textComponent
    textModuleLayout
    ${BUTTON_COMPONENT}
    textSettings { ... on textSettings_BlockType { columns } }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
  }
`;

const BLOCK_TEXT_MEDIA_MODULE = `
  ... on contentBuilder_textMediaModule_BlockType {
    ${OPTIONAL_HEADING}
    textComponent
    textMediaBreakout
    ${BUTTON_COMPONENT}
    textMediaDesktopSettings {
      ... on textMediaDesktopSettings_BlockType {
        mediaPosition mediaWidth mediaTopOffset textTopOffset showBorder
      }
    }
    textMediaMobileSettings {
      ... on textMediaMobileSettings_BlockType { mediaPosition }
    }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
    ${NESTED_COMPONENTS}
  }
`;

const BLOCK_IMAGE_MODULE = `
  ... on contentBuilder_imageModule_BlockType {
    ${OPTIONAL_HEADING}
    imageComponent { ${ASSET_FIELDS} }
    layoutArea captionPosition infoTextPosition
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
  }
`;

const BLOCK_VIDEO_MODULE = `
  ... on contentBuilder_videoModule_BlockType {
    ${OPTIONAL_HEADING}
    videoComponent { ${ASSET_FIELDS} }
    layoutArea captionPosition
    videoSettings {
      ... on videoSettings_BlockType { videoCta controls autoplay loop muted }
    }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
  }
`;

const BLOCK_TABLE_MODULE = `
  ... on contentBuilder_tableModule_BlockType {
    ${OPTIONAL_HEADING}
    table { columns { heading alignment } rows }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
  }
`;

const BLOCK_ENTRY_LINKS_MODULE = `
  ... on contentBuilder_entryLinksModule_BlockType {
    ${OPTIONAL_HEADING}
    textComponent
    ${BUTTON_COMPONENT}
    entryLinks { id title slug uri __typename }
    extendedEntryList
    entryLinksType
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
  }
`;

const BLOCK_ACCORDION_MODULE = `
  ... on contentBuilder_accordionModule_BlockType {
    ${OPTIONAL_HEADING}
    accordionSettings {
      ... on accordionSettings_BlockType { openOnlyOnePanel }
    }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
    children {
      __typename
      ... on contentBuilder_accordionPanel_BlockType {
        textComponent
        initiallyOpened
        children {
          __typename
          ${BLOCK_TEXT_MODULE}
          ${BLOCK_TEXT_MEDIA_MODULE}
          ${BLOCK_IMAGE_MODULE}
          ${BLOCK_VIDEO_MODULE}
        }
      }
    }
  }
`;

const BLOCK_THUMBNAIL_TABS_MODULE = `
  ... on contentBuilder_thumbnailTabsModule_BlockType {
    ${OPTIONAL_HEADING}
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
    children {
      __typename
      ... on contentBuilder_thumbnailTab_BlockType {
        imageComponent { ${ASSET_FIELDS} }
        children {
          __typename
          ${BLOCK_TEXT_MODULE}
          ${BLOCK_TEXT_MEDIA_MODULE}
          ${BLOCK_IMAGE_MODULE}
          ${BLOCK_VIDEO_MODULE}
        }
      }
    }
  }
`;

const BLOCK_TEXT_SLIDER_MODULE = `
  ... on contentBuilder_textSliderModule_BlockType {
    ${OPTIONAL_HEADING}
    textComponent
    ${BUTTON_COMPONENT}
    textMediaDesktopSettings {
      ... on textMediaDesktopSettings_BlockType {
        mediaPosition mediaWidth mediaTopOffset textTopOffset showBorder
      }
    }
    contentSliderSettings {
      ... on contentSliderSettings_BlockType {
        effect slideWidth pagination loop autoplay controlPosition
      }
    }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
    children {
      __typename
      ... on contentBuilder_mediaSlide_BlockType {
        standardTextWithoutAlignment
        children {
          __typename
          ${BLOCK_IMAGE_MODULE}
          ${BLOCK_VIDEO_MODULE}
          ... on contentBuilder_nestedImageComponent_BlockType {
            imageComponent { ${ASSET_FIELDS} }
            captionPosition infoTextPosition
          }
          ... on contentBuilder_nestedVideoComponent_BlockType {
            videoComponent { ${ASSET_FIELDS} }
            captionPosition
          }
        }
      }
      ... on contentBuilder_slide_BlockType {
        standardTextWithoutAlignment
        children {
          __typename
          ... on contentBuilder_nestedImageComponent_BlockType {
            imageComponent { ${ASSET_FIELDS} }
          }
          ... on contentBuilder_nestedVideoComponent_BlockType {
            videoComponent { ${ASSET_FIELDS} }
          }
        }
      }
    }
  }
`;

const BLOCK_MULTICOLUMN_MODULE = `
  ... on contentBuilder_multicolumnModule_BlockType {
    ${OPTIONAL_HEADING}
    columnSettings {
      ... on columnSettings_BlockType { columns gap }
    }
    colorTheme
    ${BACKGROUND_SETTINGS}
    ${SPACING_SETTINGS}
    children {
      __typename
      ... on contentBuilder_column_BlockType {
        columnSettings {
          ... on columnSettings_BlockType { columns gap }
        }
        children {
          __typename
          ${BLOCK_TEXT_MODULE}
          ${BLOCK_TEXT_MEDIA_MODULE}
          ${BLOCK_IMAGE_MODULE}
          ${BLOCK_VIDEO_MODULE}
          ... on contentBuilder_nestedImageComponent_BlockType {
            imageComponent { ${ASSET_FIELDS} }
            captionPosition infoTextPosition
          }
          ... on contentBuilder_nestedVideoComponent_BlockType {
            videoComponent { ${ASSET_FIELDS} }
            captionPosition
          }
          ... on contentBuilder_nestedTextComponent_BlockType { textComponent }
        }
      }
    }
  }
`;

const BLOCK_INTERACTION_MODULE = `
  ... on contentBuilder_interactionModule_BlockType {
    interactions {
      id title slug uri __typename
    }
  }
`;

const BLOCK_NEXT_CHAPTER_MODULE = `
  ... on contentBuilder_nextChapterModule_BlockType {
    textComponent
    singleCollection { id title slug uri }
    singlePlaylist { id title slug uri }
    colorTheme
    ${SPACING_SETTINGS}
  }
`;

const BLOCK_FEEDBACK_LAYER = `
  ... on contentBuilder_feedbackLayerModule_BlockType {
    colorTheme
    ${SPACING_SETTINGS}
  }
`;

// ── All top-level content blocks (used in sectionModule children) ─────────────
const ALL_CONTENT_BLOCKS = `
  __typename id
  ${BLOCK_TEXT_MODULE}
  ${BLOCK_TEXT_MEDIA_MODULE}
  ${BLOCK_IMAGE_MODULE}
  ${BLOCK_VIDEO_MODULE}
  ${BLOCK_TABLE_MODULE}
  ${BLOCK_ENTRY_LINKS_MODULE}
  ${BLOCK_ACCORDION_MODULE}
  ${BLOCK_THUMBNAIL_TABS_MODULE}
  ${BLOCK_TEXT_SLIDER_MODULE}
  ${BLOCK_MULTICOLUMN_MODULE}
  ${BLOCK_INTERACTION_MODULE}
  ${BLOCK_NEXT_CHAPTER_MODULE}
  ${BLOCK_FEEDBACK_LAYER}
`;

// ── Stage fragment ────────────────────────────────────────────────────────────
const STAGE_FRAGMENT = `
  stage {
    ... on stage_BlockType {
      alignment overline headline subline layout order colorTheme
      keyvisual { ${ASSET_FIELDS} }
      video {
        __typename
        ... on video_stagevideo_BlockType {
          videoComponent { ${ASSET_FIELDS} }
          videoSettings {
            ... on videoSettings_BlockType { videoCta controls autoplay loop muted }
          }
        }
      }
    }
  }
`;

// ── Taxonomy fragment ─────────────────────────────────────────────────────────
const TAXONOMY_FRAGMENT = `
  taxonomy {
    ... on taxonomy_BlockType {
      mainCategories { ... on mainCategory_Category { id title slug } }
      tags { ... on contentTags_Tag { id title } }
    }
  }
`;

// ── Quiz interaction question types ──────────────────────────────────────────
const FEEDBACK_BLOCKS = `
  positiveFeedback {
    ... on positiveFeedback_BlockType {
      feedbackIcon feedbackHeadline feedbackText
      image { ${ASSET_FIELDS} }
    }
  }
  negativeFeedback {
    ... on negativeFeedback_BlockType {
      feedbackIcon feedbackHeadline feedbackText
      image { ${ASSET_FIELDS} }
    }
  }
  solutionFeedback {
    ... on solutionFeedback_BlockType {
      feedbackIcon feedbackHeadline feedbackText
      image { ${ASSET_FIELDS} }
    }
  }
`;

const OPTIONAL_IMAGE = `
  optionalImageComponent {
    ... on optionalImageComponent_image_BlockType {
      imageComponent { ${ASSET_FIELDS} }
    }
  }
`;

const OPTIONAL_SOUND = `
  optionalSoundButtonComponent {
    ... on optionalSoundButtonComponent_button_BlockType {
      soundButtonComponentStatic {
        ... on soundButtonComponentStatic_BlockType {
          label soundFile { ${ASSET_FIELDS} }
        }
      }
    }
  }
`;

const INTERACTION_BUILDER_FRAGMENT = `
  interactionBuilder {
    __typename id
    ... on interactionBuilder_choiceModule_BlockType {
      questionOverline question questionInstruction
      forceMultipleChoice disableShuffle stacked
      ${OPTIONAL_IMAGE}
      ${OPTIONAL_SOUND}
      choiceAnswerOptions {
        ... on choiceAnswerOptions_BlockType {
          answerText correctAnswer
          asset { ${ASSET_FIELDS} }
        }
      }
      ${FEEDBACK_BLOCKS}
      colorTheme ${BACKGROUND_SETTINGS} ${SPACING_SETTINGS}
    }
    ... on interactionBuilder_trueFalseModule_BlockType {
      questionOverline question questionInstruction stacked
      ${OPTIONAL_IMAGE}
      ${OPTIONAL_SOUND}
      trueFalseAnswerOptions {
        ... on trueFalseAnswerOptions_BlockType { trueLabel falseLabel correctAnswer }
      }
      positiveFeedback {
        ... on positiveFeedback_BlockType { feedbackIcon feedbackHeadline feedbackText image { ${ASSET_FIELDS} } }
      }
      negativeFeedback {
        ... on negativeFeedback_BlockType { feedbackIcon feedbackHeadline feedbackText image { ${ASSET_FIELDS} } }
      }
      colorTheme ${BACKGROUND_SETTINGS} ${SPACING_SETTINGS}
    }
    ... on interactionBuilder_valueSliderModule_BlockType {
      questionOverline question questionInstruction stacked
      ${OPTIONAL_IMAGE}
      ${OPTIONAL_SOUND}
      valueSliderConfiguration {
        ... on valueSliderConfiguration_BlockType {
          minValue minLabel maxValue maxLabel steps
          currentValueLabel initialValue correctValue correctThreshold
        }
      }
      ${FEEDBACK_BLOCKS}
      colorTheme ${BACKGROUND_SETTINGS} ${SPACING_SETTINGS}
    }
    ... on interactionBuilder_sortableRankingListModule_BlockType {
      questionOverline question questionInstruction stacked
      ${OPTIONAL_IMAGE}
      ${OPTIONAL_SOUND}
      sortableAnswerItems {
        ... on sortableAnswerItems_BlockType { item }
      }
      ${FEEDBACK_BLOCKS}
      colorTheme ${BACKGROUND_SETTINGS} ${SPACING_SETTINGS}
    }
    ... on interactionBuilder_fillTheBlankModule_BlockType {
      questionOverline question questionInstruction textWithoutFormating stacked
      ${OPTIONAL_IMAGE}
      ${OPTIONAL_SOUND}
      ${FEEDBACK_BLOCKS}
      colorTheme ${BACKGROUND_SETTINGS} ${SPACING_SETTINGS}
    }
    ... on interactionBuilder_DragDropModule_BlockType {
      questionOverline question questionInstruction disableShuffle stacked
      ${OPTIONAL_IMAGE}
      ${OPTIONAL_SOUND}
      dragDrop {
        ... on dragDrop_BlockType {
          drag {
            __typename
            ... on drag_dragDropText_BlockType { textComponent }
            ... on drag_dragDropImage_BlockType { imageComponent { ${ASSET_FIELDS} } }
          }
          drop {
            __typename
            ... on drop_dropText_BlockType { textComponent }
            ... on drop_dropImage_BlockType { imageComponent { ${ASSET_FIELDS} } }
          }
        }
      }
      ${FEEDBACK_BLOCKS}
      colorTheme ${BACKGROUND_SETTINGS} ${SPACING_SETTINGS}
    }
  }
`;

// ── Main query ────────────────────────────────────────────────────────────────
const FULL_QUERY = `
{
  collection: coursesEntries(slug: "grohe-ceramics-basics") {
    ... on courses_courses_Entry {
      id uid title slug uri language siteHandle dateCreated dateUpdated
      isLandingpage colorTheme productlineTheme topic
      ${TAXONOMY_FRAGMENT}
      ${STAGE_FRAGMENT}
      collectionData {
        ... on collectionData_BlockType { heroText isHero heroVideo { ${ASSET_FIELDS} } }
      }
      contentBuilder {
        __typename id
        ... on contentBuilder_sectionModule_BlockType {
          children { ${ALL_CONTENT_BLOCKS} }
        }
        ${BLOCK_TEXT_MODULE}
        ${BLOCK_TEXT_MEDIA_MODULE}
        ${BLOCK_IMAGE_MODULE}
        ${BLOCK_VIDEO_MODULE}
        ${BLOCK_ENTRY_LINKS_MODULE}
      }
    }
  }

  trainings: trainingsEntries(
    slug: [
      "grohe-ceramics-features-and-benefits"
      "grohe-ceramics-product-range"
      "grohe-ceramics-production-process"
      "grohe-ceramics-sales-support"
    ]
  ) {
    ... on trainings_trainings_Entry {
      id uid title slug uri language siteHandle dateCreated dateUpdated
      topic trainingActivity colorTheme productlineTheme showPlaylistNavigation
      ${TAXONOMY_FRAGMENT}
      ${STAGE_FRAGMENT}
      playlistMetaInformation {
        ... on playlistMetaInformation_BlockType { readingTime }
      }
      contentDependencies {
        ... on contentDependencies_BlockType {
          overview { id title slug uri }
          nextChapter { id title slug uri }
          previousChapter { id title slug uri }
        }
      }
      contentBuilder {
        __typename id
        ... on contentBuilder_sectionModule_BlockType {
          children { ${ALL_CONTENT_BLOCKS} }
        }
        ${BLOCK_NEXT_CHAPTER_MODULE}
        ${BLOCK_FEEDBACK_LAYER}
        ${BLOCK_TEXT_MODULE}
        ${BLOCK_TEXT_MEDIA_MODULE}
        ${BLOCK_VIDEO_MODULE}
      }
    }
  }

  quiz: quizzesEntries(slug: "ceramics-quiz") {
    ... on quizzes_quizzes_Entry {
      id uid title slug uri language siteHandle dateCreated dateUpdated
      trainingActivity colorTheme productlineTheme
      ${TAXONOMY_FRAGMENT}
      quizMetaInformation {
        ... on quizMetaInformation_BlockType {
          overline headline subline text
          shuffleInteractions numberOfInteractions passingScore enableFeedback
          keyvisual { ${ASSET_FIELDS} }
        }
      }
      positiveFeedback {
        ... on positiveFeedback_BlockType {
          feedbackIcon feedbackHeadline feedbackText
          image { ${ASSET_FIELDS} }
        }
      }
      negativeFeedback {
        ... on negativeFeedback_BlockType {
          feedbackIcon feedbackHeadline feedbackText
          image { ${ASSET_FIELDS} }
        }
      }
      correspondingTraining { id title slug uri }
      interactions {
        id uid title slug uri language dateCreated dateUpdated
        ... on quizInteractions_quizInteractions_Entry {
          interactionMetaInformation {
            ... on interactionMetaInformation_BlockType {
              headline includeInStoryNavigation readingTime
            }
          }
          ${INTERACTION_BUILDER_FRAGMENT}
          interactionRelatedNuggets { id title slug uri }
        }
      }
    }
  }

  globalTracking: globalSets(handle: "globalTracking") {
    ... on globalTracking_GlobalSet {
      courseData {
        __typename
        ... on courseData_collections_BlockType {
          collection { id title slug uri }
          stories { id title slug uri __typename }
        }
        ... on courseData_compactTrainings_BlockType {
          compactTraining { id title slug uri }
        }
      }
    }
  }
}
`;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function gqlRequest(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const url = new URL(ENDPOINT);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Querying Craft CMS GraphQL API (read-only)...');
  console.log('Endpoint:', ENDPOINT);
  console.log('');

  const result = await gqlRequest(FULL_QUERY);

  if (result.errors) {
    console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
    fs.writeFileSync(path.join(OUT_DIR, 'errors.json'), JSON.stringify(result.errors, null, 2));
    process.exit(1);
  }

  const data = result.data;

  // ── Filter globalTracking to ceramics collection only ──
  const ceramicsId = data.collection[0]?.id;
  if (data.globalTracking && data.globalTracking[0]) {
    const allCourseData = data.globalTracking[0].courseData || [];
    data.globalTracking[0].courseData = allCourseData.filter(cd =>
      cd.__typename === 'courseData_collections_BlockType' &&
      Array.isArray(cd.collection) &&
      cd.collection.some(c => c.id === ceramicsId)
    );
  }

  // ── Save complete export ──
  const outFile = path.join(OUT_DIR, 'grohe-ceramics-basics-full.json');
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log('Saved:', outFile);

  // ── Summary ──
  const col = data.collection[0];
  const trainings = data.trainings || [];
  const quiz = data.quiz[0];
  const interactions = quiz?.interactions || [];

  console.log('\n── Export Summary ──────────────────────────────────');
  console.log('Collection:  ', col?.title, `(id: ${col?.id})`);
  console.log('Trainings:   ', trainings.length);
  trainings.forEach(t => {
    const blocks = (t.contentBuilder || []).reduce((acc, b) => {
      if (b.__typename === 'contentBuilder_sectionModule_BlockType') {
        return acc + (b.children || []).length;
      }
      return acc + 1;
    }, 0);
    console.log(`  - ${t.title}: ${t.contentBuilder?.length} section(s), ${blocks} child block(s)`);
  });
  console.log('Quiz:        ', quiz?.title, `(${interactions.length} interactions)`);
  const qtypes = {};
  interactions.forEach(i => {
    (i.interactionBuilder || []).forEach(ib => {
      qtypes[ib.__typename] = (qtypes[ib.__typename] || 0) + 1;
    });
  });
  Object.entries(qtypes).forEach(([k, v]) => console.log(`  - ${k.replace('interactionBuilder_','').replace('_BlockType','')}: ${v}`));

  // ── Collect all asset URLs referenced ──
  const allJson = JSON.stringify(data);
  const assetMatches = new Set();
  const urlRegex = /"url"\s*:\s*"(https?:\/\/[^"]+)"/g;
  let match;
  while ((match = urlRegex.exec(allJson)) !== null) {
    assetMatches.add(match[1]);
  }
  console.log('\nDistinct asset URLs referenced:', assetMatches.size);

  const assetListFile = path.join(OUT_DIR, 'asset-urls.txt');
  fs.writeFileSync(assetListFile, [...assetMatches].sort().join('\n'));
  console.log('Asset URL list saved:', assetListFile);

  const sizeKB = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`\nOutput file size: ${sizeKB} KB`);
  console.log('\nDone. All queries were READ-ONLY.');
})();
