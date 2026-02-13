/**
 * lcuWebSocket.js
 *
 * WebSocket client that connects to the LCU and subscribes to
 * WAMP-style events for champ-select session updates.
 *
 * The LCU uses a custom WAMP protocol over WebSocket:
 *  - [5, "EventName"]           → Subscribe to an event
 *  - [6, "EventName"]           → Unsubscribe from an event
 *  - [8, "EventName", payload]  → Event message from server
 *
 * We subscribe to the champ-select session endpoint to get real-time
 * updates on bans, picks, and role assignments.
 */

const WebSocket = require('ws');
const { EventEmitter } = require('events');

const CHAMP_SELECT_EVENT = 'OnJsonApiEvent_lol-champ-select_v1_session';

class LcuWebSocket extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.connected = false;
        this._reconnectTimer = null;
    }

    /**
     * Connect to the LCU WebSocket.
     * @param {{ port: string, token: string }} credentials
     */
    connect({ port, token }) {
        if (this.ws) {
            this.disconnect();
        }

        const authString = Buffer.from(`riot:${token}`).toString('base64');
        const url = `wss://127.0.0.1:${port}/`;

        console.log(`[LCU WS] Connecting to ${url}...`);

        this.ws = new WebSocket(url, {
            headers: {
                'Authorization': `Basic ${authString}`,
            },
            rejectUnauthorized: false, // Self-signed cert
        });

        this.ws.on('open', () => {
            console.log('[LCU WS] Connected successfully');
            this.connected = true;
            this.emit('connected');

            // Subscribe to champ-select events using WAMP protocol
            // [5, "eventName"] = Subscribe
            this._subscribe(CHAMP_SELECT_EVENT);
        });

        this.ws.on('message', (data) => {
            this._handleMessage(data.toString());
        });

        this.ws.on('close', (code, reason) => {
            console.log(`[LCU WS] Disconnected (code: ${code})`);
            this.connected = false;
            this.emit('disconnected');
        });

        this.ws.on('error', (err) => {
            // ECONNREFUSED is expected when League Client is not running
            if (err.code !== 'ECONNREFUSED') {
                console.error('[LCU WS] Error:', err.message);
            }
            this.connected = false;
            this.emit('error', err);
        });
    }

    /**
     * Subscribe to a WAMP event.
     * @param {string} eventName
     */
    _subscribe(eventName) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify([5, eventName]);
            this.ws.send(msg);
            console.log(`[LCU WS] Subscribed to: ${eventName}`);
        }
    }

    /**
     * Handle incoming WAMP messages.
     * Format: [opcode, eventName, payload]
     * Opcode 8 = Event notification
     * @param {string} raw
     */
    _handleMessage(raw) {
        try {
            const message = JSON.parse(raw);

            // WAMP event message format: [8, "EventName", { data, eventType, uri }]
            if (!Array.isArray(message) || message.length < 3) return;

            const [opcode, eventName, payload] = message;

            if (opcode === 8 && eventName === CHAMP_SELECT_EVENT) {
                const { eventType, data } = payload;

                switch (eventType) {
                    case 'Create':
                        console.log('[LCU WS] Champ Select STARTED');
                        this.emit('champSelectStarted', data);
                        break;

                    case 'Update':
                        this.emit('champSelectUpdated', data);
                        break;

                    case 'Delete':
                        console.log('[LCU WS] Champ Select ENDED');
                        this.emit('champSelectEnded');
                        break;

                    default:
                        console.log(`[LCU WS] Unknown eventType: ${eventType}`);
                }
            }
        } catch (err) {
            // Some messages might not be JSON (e.g., WAMP handshake)
            // Silently ignore
        }
    }

    /**
     * Disconnect from the WebSocket.
     */
    disconnect() {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.removeAllListeners();
            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close();
            }
            this.ws = null;
            this.connected = false;
        }
    }
}

module.exports = { LcuWebSocket };
