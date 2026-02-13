/**
 * lcuClient.js
 *
 * HTTPS REST client for the League Client Update (LCU) API.
 * 
 * IMPORTANT: Riot's LCU uses a self-signed SSL certificate.
 * We handle this by creating an HTTPS agent with rejectUnauthorized: false.
 * Authentication uses HTTP Basic with username "riot" and the lockfile token.
 */

const axios = require('axios');
const https = require('https');

/**
 * Creates an axios instance configured for the LCU API.
 * @param {{ port: string, token: string, protocol: string }} credentials
 * @returns {import('axios').AxiosInstance}
 */
function createLcuClient({ port, token, protocol }) {
    // Create HTTPS agent that accepts self-signed certificates
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Required for Riot's self-signed cert
    });

    // Encode credentials for Basic Auth: "riot:{token}"
    const authString = Buffer.from(`riot:${token}`).toString('base64');

    const client = axios.create({
        baseURL: `${protocol}://127.0.0.1:${port}`,
        httpsAgent,
        headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        timeout: 5000,
    });

    // Response interceptor for logging
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response) {
                console.error(`[LCU HTTP] ${error.response.status} — ${error.config?.url}`);
            } else {
                console.error(`[LCU HTTP] Request failed — ${error.message}`);
            }
            return Promise.reject(error);
        }
    );

    return client;
}

/**
 * Helper: Get current summoner info.
 */
async function getCurrentSummoner(client) {
    const res = await client.get('/lol-summoner/v1/current-summoner');
    return res.data;
}

/**
 * Helper: Get the champ-select session.
 */
async function getChampSelectSession(client) {
    const res = await client.get('/lol-champ-select/v1/session');
    return res.data;
}

/**
 * Helper: Get champion data by ID from the client.
 */
async function getChampionById(client, championId) {
    const res = await client.get(`/lol-champions/v1/inventories/${championId}/champions`);
    return res.data;
}

module.exports = {
    createLcuClient,
    getCurrentSummoner,
    getChampSelectSession,
    getChampionById,
};
