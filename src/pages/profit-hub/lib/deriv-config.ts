/**
 * Deriv API Configuration - Official OAuth Flow
 * @see https://developers.deriv.com/docs/authentication
 */

// Single App ID for all environments (production)
export const DERIV_APP_ID = 106629;

// Get current page URL for OAuth redirect
export const DERIV_REDIRECT_URL = typeof window !== 'undefined' ? window.location.origin : '';

export const DERIV_CONFIG = {
    APP_ID: DERIV_APP_ID,
    REDIRECT_URL: DERIV_REDIRECT_URL,
} as const;

// Official Deriv Platform URLs
export const DERIV_PLATFORMS = {
    DTRADER: 'https://app.deriv.com',
    DBOT: 'https://app.deriv.com/bot',
    SMARTTRADER: 'https://smarttrader.deriv.com',
    COPYTRADING: 'https://app.deriv.com/copy-trading',
} as const;

// Official Deriv API Endpoints
export const DERIV_API = {
    WEBSOCKET: 'wss://ws.derivws.com/websockets/v3',
    OAUTH: 'https://oauth.deriv.com/oauth2/authorize',
} as const;

// Official GitHub Repositories (for reference)
export const DERIV_REPOS = {
    MAIN_APP: {
        name: 'deriv-app',
        url: 'https://github.com/deriv-com/deriv-app',
        description: 'Main Deriv web platform',
    },
    DBOT: {
        name: 'deriv-bot',
        url: 'https://github.com/deriv-com/deriv-bot',
        description: 'Official DBot',
    },
    API: {
        name: 'deriv-api',
        url: 'https://github.com/deriv-com/deriv-api',
        description: 'Official Deriv WebSocket API SDK',
    },
} as const;
