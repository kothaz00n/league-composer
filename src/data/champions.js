/**
 * champions.js — Data Dragon Helper
 *
 * Provides champion ID ↔ name mapping AND champion tags/archetypes
 * using Riot's Data Dragon CDN. Caches the data locally after first fetch.
 */

const axios = require('axios');

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';
let championData = null;
let idToNameMap = null;
let nameToIdMap = null;
let championTagsMap = null; // name → tags array (e.g., ["Fighter", "Tank"])
let latestVersion = null;

/**
 * Fetches the latest champion data from Data Dragon.
 * Includes tags (archetypes) for each champion.
 * @returns {Promise<void>}
 */
async function loadChampionData() {
    if (championData) return;

    try {
        // Get latest version
        const versionsRes = await axios.get(`${DDRAGON_BASE}/api/versions.json`);
        latestVersion = versionsRes.data[0];

        // Get champion data
        const champRes = await axios.get(
            `${DDRAGON_BASE}/cdn/${latestVersion}/data/en_US/champion.json`
        );

        championData = champRes.data.data;
        idToNameMap = {};
        nameToIdMap = {};
        championTagsMap = {};

        for (const [name, info] of Object.entries(championData)) {
            const id = parseInt(info.key, 10);
            idToNameMap[id] = name;
            nameToIdMap[name] = id;
            // Store tags (e.g., ["Fighter", "Tank"])
            championTagsMap[name] = info.tags || [];
        }

        console.log(`[Champions] Loaded ${Object.keys(idToNameMap).length} champions with tags (v${latestVersion})`);
    } catch (err) {
        console.error('[Champions] Failed to load Data Dragon:', err.message);
        // Fall back to empty maps — the app will still work with IDs
        idToNameMap = {};
        nameToIdMap = {};
        championTagsMap = {};
        latestVersion = '16.3.1'; // Fallback version
    }
}

/**
 * Get champion name from ID.
 * @param {number} id
 * @returns {string}
 */
function getChampionName(id) {
    if (!idToNameMap) return `Champion ${id}`;
    return idToNameMap[id] || `Champion ${id}`;
}

/**
 * Get champion ID from name.
 * @param {string} name
 * @returns {number | null}
 */
function getChampionId(name) {
    if (!nameToIdMap) return null;
    return nameToIdMap[name] || null;
}

/**
 * Get the Riot Data Dragon tags for a champion (e.g., ["Fighter", "Tank"]).
 * @param {string|number} nameOrId - champion name or numeric ID
 * @returns {string[]}
 */
function getChampionTags(nameOrId) {
    if (!championTagsMap) return [];

    // If numeric, resolve to name first
    const name = typeof nameOrId === 'number'
        ? (idToNameMap?.[nameOrId] || null)
        : nameOrId;

    if (!name) return [];
    return championTagsMap[name] || [];
}

/**
 * Get the champion square portrait URL.
 * @param {string} championName
 * @returns {string}
 */
function getChampionIconUrl(championName) {
    const version = latestVersion;
    return `${DDRAGON_BASE}/cdn/${version}/img/champion/${championName}.png`;
}

/**
 * Get the latest Data Dragon version.
 * @returns {string}
 */
function getLatestVersion() {
    return latestVersion;
}

/**
 * Get all champion data.
 */
function getAllChampions() {
    return championData || {};
}

/**
 * Get the full ID → name map.
 * @returns {Object<number, string>}
 */
function getIdToNameMap() {
    return idToNameMap || {};
}

/**
 * Get the full name → ID map.
 * @returns {Object<string, number>}
 */
function getNameToIdMap() {
    return nameToIdMap || {};
}

/**
 * Get a map of lowercase name -> correct ID (e.g., "twistedfate" -> "TwistedFate").
 * Also handles common mapping issues if possible.
 */
function getChampionNameMap() {
    if (!nameToIdMap) return {};
    const map = {};
    for (const name of Object.keys(nameToIdMap)) {
        map[name.toLowerCase()] = name;
        map[name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()] = name;
        // Manual overrides for known deviations if needed
        if (name === 'MonkeyKing') {
            map['wukong'] = 'MonkeyKing';
        }
        if (name === 'Renata') { // Riot sometimes uses RenataGlasc
            // check if it's RenataGlasc in newer versions
        }
    }
    return map;
}

module.exports = {
    loadChampionData,
    getChampionName,
    getChampionId,
    getChampionTags,
    getChampionIconUrl,
    getLatestVersion,
    getAllChampions,
    getIdToNameMap,
    getNameToIdMap,
    getChampionNameMap,
};
