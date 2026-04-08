/**
 * Algolia Search Service
 *
 * Provides indexing and search functions for modules and lessons.
 * Uses the algoliasearch v5 client.
 */
const { algoliasearch } = require("algoliasearch");
const config = require("../config");

const INDEX_MODULES = "modules";
const INDEX_LESSONS = "lessons";

let client = null;

/**
 * Get or create the Algolia client (lazy init).
 * @return {object|null} The Algolia client or null if not configured.
 */
function getClient() {
  if (!client) {
    if (!config.algolia.appId || !config.algolia.adminKey) {
      console.warn("Algolia credentials not configured. Search indexing disabled.");
      return null;
    }
    client = algoliasearch(config.algolia.appId, config.algolia.adminKey);
  }
  return client;
}

/**
 * Index a module into Algolia.
 * @param {object} module - Module data with id field
 */
async function indexModule(module) {
  try {
    const c = getClient();
    if (!c) return;

    const { id, createdAt, updatedAt, ...rest } = module;
    const record = {
      objectID: id,
      type: "module",
      ...rest,
    };
    // Add timestamps as unix seconds if they exist
    if (createdAt && typeof createdAt.toDate === "function") {
      record.createdAt = Math.floor(createdAt.toDate().getTime() / 1000);
    } else if (createdAt) {
      record.createdAt = typeof createdAt === "number" ? createdAt : null;
    }

    await c.saveObject({ indexName: INDEX_MODULES, body: record });
  } catch (err) {
    console.error("Algolia indexModule error:", err);
  }
}

/**
 * Index a lesson into Algolia.
 * @param {object} lesson - Lesson data with id field
 */
async function indexLesson(lesson) {
  try {
    const c = getClient();
    if (!c) return;

    const { id, content, createdAt, updatedAt, ...rest } = lesson;
    const record = {
      objectID: id,
      type: "lesson",
      ...rest,
    };
    // Store a truncated snippet of content for search (not the full HTML)
    if (content) {
      record.contentSnippet = String(content).replace(/<[^>]+>/g, "").slice(0, 500);
    }
    if (createdAt && typeof createdAt.toDate === "function") {
      record.createdAt = Math.floor(createdAt.toDate().getTime() / 1000);
    } else if (createdAt) {
      record.createdAt = typeof createdAt === "number" ? createdAt : null;
    }

    await c.saveObject({ indexName: INDEX_LESSONS, body: record });
  } catch (err) {
    console.error("Algolia indexLesson error:", err);
  }
}

/**
 * Remove a module from the Algolia index.
 * @param {string} id - Module document ID
 */
async function removeModule(id) {
  try {
    const c = getClient();
    if (!c) return;
    await c.deleteObject({ indexName: INDEX_MODULES, objectID: id });
  } catch (err) {
    console.error("Algolia removeModule error:", err);
  }
}

/**
 * Remove a lesson from the Algolia index.
 * @param {string} id - Lesson document ID
 */
async function removeLesson(id) {
  try {
    const c = getClient();
    if (!c) return;
    await c.deleteObject({ indexName: INDEX_LESSONS, objectID: id });
  } catch (err) {
    console.error("Algolia removeLesson error:", err);
  }
}

/**
 * Search across both modules and lessons indexes.
 *
 * @param {string} query - Search query string
 * @param {object} options
 * @param {string} [options.type] - Filter to "module" or "lesson"
 * @param {number} [options.page=0] - Page number (0-based)
 * @param {number} [options.hitsPerPage=20] - Results per page
 * @return {Promise<{results: Array, pagination: object}>}
 */
async function searchAll(query, options = {}) {
  try {
    const c = getClient();
    if (!c) {
      return { results: [], pagination: { limit: 20, hasMore: false, nextCursor: null } };
    }

    const { type, page = 0, hitsPerPage = 20 } = options;

    // Build queries for the indexes we need to search
    const requests = [];
    if (!type || type === "module") {
      requests.push({
        indexName: INDEX_MODULES,
        query,
        params: { hitsPerPage, page },
      });
    }
    if (!type || type === "lesson") {
      requests.push({
        indexName: INDEX_LESSONS,
        query,
        params: { hitsPerPage, page },
      });
    }

    const { results: algoliaResults } = await c.search({ requests });

    // Merge hits from all indexes
    const merged = [];
    let totalHits = 0;
    let totalPages = 0;

    for (const result of algoliaResults) {
      totalHits += result.nbHits || 0;
      totalPages = Math.max(totalPages, result.nbPages || 0);

      for (const hit of result.hits) {
        const { objectID, _highlightResult, contentSnippet, ...rest } = hit;
        merged.push({
          id: objectID,
          ...rest,
        });
      }
    }

    const hasMore = page + 1 < totalPages;

    return {
      results: merged,
      pagination: {
        limit: hitsPerPage,
        hasMore,
        nextCursor: hasMore ? String(page + 1) : null,
        page,
        totalHits,
      },
    };
  } catch (err) {
    console.error("Algolia searchAll error:", err);
    return { results: [], pagination: { limit: 20, hasMore: false, nextCursor: null } };
  }
}

/**
 * Batch index multiple records into an index.
 * Used by the sync script.
 *
 * @param {string} indexName - "modules" or "lessons"
 * @param {Array} records - Array of objects with objectID set
 */
async function batchIndex(indexName, records) {
  const c = getClient();
  if (!c) return;
  await c.saveObjects({ indexName, objects: records });
}

module.exports = {
  indexModule,
  indexLesson,
  removeModule,
  removeLesson,
  searchAll,
  batchIndex,
  INDEX_MODULES,
  INDEX_LESSONS,
};
