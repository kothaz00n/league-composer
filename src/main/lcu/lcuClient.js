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
 * Creates an HTTPS agent specifically configured for the LCU API.
 *
 * SECURITY NOTE:
 * The League Client Update (LCU) uses a self-signed certificate that is generated
 * dynamically and not signed by a trusted Certificate Authority (CA).
 *
 * To connect to it, we must bypass standard certificate validation using
 * `rejectUnauthorized: false`.
 *
 * This is acceptable in this specific context because:
 * 1. The connection is strictly limited to `127.0.0.1` (localhost).
 * 2. The port and authentication token are read from the lockfile created by the
 *    authenticated LCU process itself.
 * 3. The risk of Man-in-the-Middle (MitM) attacks on the loopback interface is
 *    limited to local attackers with enough privileges to intercept traffic,
 *    who would likely already have full system access.
 *
 * @returns {https.Agent} Configured HTTPS agent.
 */
function createLcuHttpsAgent() {
    return new https.Agent({
        rejectUnauthorized: false,
    });
}

/**
 * Creates an axios instance configured for the LCU API.
 * @param {{ port: string, token: string, protocol: string }} credentials
 * @returns {import('axios').AxiosInstance}
 */
function createLcuClient({ port, token, protocol }) {
    const httpsAgent = createLcuHttpsAgent();

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
