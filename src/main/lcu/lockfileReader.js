/**
 * lockfileReader.js
 * 
 * Reads the League of Legends lockfile to extract LCU connection parameters.
 * The lockfile format is: LeagueClient:PID:PORT:TOKEN:PROTOCOL
 * 
 * Detection strategy:
 *  1. Find the running LeagueClientUx.exe process path
 *  2. Derive the lockfile path from the process install directory
 *  3. Fall back to common install paths if the process scan fails
 *  4. Extract port + token from the process command line as a last resort
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Common install paths to try (fallbacks)
const COMMON_LOCKFILE_PATHS = [
    path.join('C:', 'Riot Games', 'League of Legends', 'lockfile'),
    path.join('D:', 'Riot Games', 'League of Legends', 'lockfile'),
    path.join('B:', 'Riot Games', 'League of Legends', 'lockfile'),
    path.join('C:', 'Program Files', 'Riot Games', 'League of Legends', 'lockfile'),
    path.join('C:', 'Program Files (x86)', 'Riot Games', 'League of Legends', 'lockfile'),
];

/**
 * Parses the lockfile content into usable connection data.
 * @param {string} content - Raw lockfile content
 * @returns {{ processName: string, pid: string, port: string, token: string, protocol: string }}
 */
function parseLockfile(content) {
    const parts = content.trim().split(':');
    if (parts.length < 5) {
        throw new Error(`Invalid lockfile format: expected 5 parts, got ${parts.length}`);
    }

    return {
        processName: parts[0],
        pid: parts[1],
        port: parts[2],
        token: parts[3],
        protocol: parts[4],
    };
}

/**
 * Try to read a lockfile from a specific path.
 * @param {string} filePath
 * @returns {{ port: string, token: string, protocol: string } | null}
 */
function tryReadFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });
        const data = parseLockfile(content);
        console.log(`[LCU] Lockfile found at ${filePath} — PID: ${data.pid}, Port: ${data.port}`);
        return {
            port: data.port,
            token: data.token,
            protocol: data.protocol,
        };
    } catch (err) {
        return null;
    }
}

/**
 * Get the install directory of League by finding the running process.
 * @returns {Promise<string | null>}
 */
function getLeagueInstallDir() {
    return new Promise((resolve) => {
        // Use PowerShell to get the process path — more reliable than WMIC
        const cmd = 'powershell -NoProfile -Command "Get-Process LeagueClientUx -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path"';

        exec(cmd, { timeout: 5000 }, (error, stdout) => {
            if (error || !stdout || !stdout.trim()) {
                resolve(null);
                return;
            }

            const processPath = stdout.trim();
            // processPath = "B:\Riot Games\League of Legends\LeagueClientUx.exe"
            // We want the directory: "B:\Riot Games\League of Legends"
            const installDir = path.dirname(processPath);
            console.log(`[LCU] Detected install directory: ${installDir}`);
            resolve(installDir);
        });
    });
}

/**
 * Fallback: Extract port and token from LeagueClientUx.exe command line args.
 * @returns {Promise<{ port: string, token: string, protocol: string } | null>}
 */
function readFromProcessArgs() {
    return new Promise((resolve) => {
        const cmd = 'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name=\'LeagueClientUx.exe\'\\" | Select-Object -ExpandProperty CommandLine"';

        exec(cmd, { timeout: 5000 }, (error, stdout) => {
            if (error || !stdout) {
                resolve(null);
                return;
            }

            const portMatch = stdout.match(/--app-port=(\d+)/);
            const tokenMatch = stdout.match(/--remoting-auth-token=([\w_-]+)/);

            if (portMatch && tokenMatch) {
                console.log(`[LCU] Extracted from process args — Port: ${portMatch[1]}`);
                resolve({
                    port: portMatch[1],
                    token: tokenMatch[1],
                    protocol: 'https',
                });
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Reads the lockfile using multiple strategies.
 * @param {string} [lockfilePath] - Optional override path
 * @returns {Promise<{ port: string, token: string, protocol: string } | null>}
 */
async function readLockfile(lockfilePath) {
    // Strategy 1: User-provided path
    if (lockfilePath) {
        const result = tryReadFile(lockfilePath);
        if (result) return result;
    }

    // Strategy 2: Find install dir from running process
    const installDir = await getLeagueInstallDir();
    if (installDir) {
        const processLockfile = path.join(installDir, 'lockfile');
        const result = tryReadFile(processLockfile);
        if (result) return result;
    }

    // Strategy 3: Try common install paths
    for (const commonPath of COMMON_LOCKFILE_PATHS) {
        const result = tryReadFile(commonPath);
        if (result) return result;
    }

    // Strategy 4: Extract directly from process command line
    const argsResult = await readFromProcessArgs();
    if (argsResult) return argsResult;

    // Nothing found
    return null;
}

module.exports = { readLockfile, parseLockfile, COMMON_LOCKFILE_PATHS };
