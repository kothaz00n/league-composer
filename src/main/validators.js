/**
 * src/main/validators.js
 *
 * Helper functions to validate IPC data payloads.
 */

/**
 * Validates the roster configuration object.
 * Expected structure:
 * {
 *   myRole: string (optional),
 *   gameMode: string (optional),
 *   roster: {
 *     [role]: {
 *       favorites: string[],
 *       player: string (optional)
 *     }
 *   }
 * }
 *
 * @param {any} data - The data to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateRosterData(data) {
    if (!data || typeof data !== 'object') return false;

    // Validate optional top-level string fields
    if (data.myRole !== undefined && typeof data.myRole !== 'string') return false;
    if (data.myRole && data.myRole.length > 50) return false;

    if (data.gameMode !== undefined && typeof data.gameMode !== 'string') return false;
    if (data.gameMode && data.gameMode.length > 50) return false;

    // Validate roster object
    if (!data.roster || typeof data.roster !== 'object') return false;

    const validRoles = ['top', 'jungle', 'mid', 'adc', 'support'];
    const rosterKeys = Object.keys(data.roster);

    // Check if roster keys are valid roles
    for (const key of rosterKeys) {
        if (!validRoles.includes(key)) {
            // Found an invalid role key
            return false;
        }

        const roleData = data.roster[key];
        if (!roleData || typeof roleData !== 'object') return false;

        // Validate favorites array
        if (!Array.isArray(roleData.favorites)) return false;
        if (roleData.favorites.length > 200) return false; // Reasonable limit

        for (const fav of roleData.favorites) {
            if (typeof fav !== 'string') return false;
            if (fav.length > 100) return false; // Reasonable name length limit
        }

        // Validate player string (optional)
        if (roleData.player !== undefined) {
            if (typeof roleData.player !== 'string') return false;
            if (roleData.player.length > 100) return false;
        }
    }

    return true;
}

module.exports = { validateRosterData };
