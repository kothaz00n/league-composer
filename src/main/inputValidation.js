const { VALID_ROLES, VALID_QUEUES } = require('../data/winRateProvider');

/**
 * Validates the win rate data payload received via IPC.
 * @param {object} data - The data payload.
 * @throws {Error} If validation fails.
 * @returns {boolean} True if valid.
 */
function validateWinRateData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid payload: Data must be an object.');
    }

    const { _queue, _roleData } = data;

    // Validate Queue
    if (!_queue || typeof _queue !== 'string') {
        throw new Error('Invalid payload: Missing or invalid _queue.');
    }
    if (!VALID_QUEUES.includes(_queue)) {
        throw new Error(`Invalid payload: Unknown queue "${_queue}". Allowed: ${VALID_QUEUES.join(', ')}.`);
    }

    // Validate Role Data
    if (!_roleData || typeof _roleData !== 'object') {
        throw new Error('Invalid payload: Missing or invalid _roleData.');
    }

    const MAX_ROLES = 10; // Generous limit (usually 5 + 'all')
    const roleKeys = Object.keys(_roleData);
    if (roleKeys.length > MAX_ROLES) {
        throw new Error('Invalid payload: Too many roles.');
    }

    for (const role of roleKeys) {
        // Allow valid roles OR 'all'
        if (!VALID_ROLES.includes(role) && role !== 'all') {
             throw new Error(`Invalid payload: Unknown role "${role}".`);
        }

        const championsData = _roleData[role];
        if (!championsData || typeof championsData !== 'object') {
            throw new Error(`Invalid payload: Data for role "${role}" must be an object.`);
        }

        const championNames = Object.keys(championsData);
        // Limit number of champions per role to prevent massive objects
        if (championNames.length > 500) { // Currently ~168 champs, 500 is safe buffer
             throw new Error(`Invalid payload: Too many champions for role "${role}".`);
        }

        for (const champName of championNames) {
            const stats = championsData[champName];
            if (!stats || typeof stats !== 'object') {
                throw new Error(`Invalid payload: Stats for champion "${champName}" in role "${role}" must be an object.`);
            }

            // Validate essential numeric properties
            // We expect at least winRate. Others might be optional but should be numbers if present.

            const numericFields = ['winRate', 'pickRate', 'banRate', 'matches'];
            for (const field of numericFields) {
                if (stats[field] !== undefined && typeof stats[field] !== 'number') {
                    throw new Error(`Invalid payload: ${field} for "${champName}" in role "${role}" must be a number.`);
                }
            }
        }
    }

    return true;
}

module.exports = {
    validateWinRateData
};
