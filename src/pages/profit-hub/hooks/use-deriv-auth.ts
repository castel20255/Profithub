'use client';

import { useEffect, useState } from 'react';
import { DERIV_CONFIG, DERIV_API } from '@/profit-hub/lib/deriv-config';

interface Balance {
    amount: number;
    currency: string;
}

interface Account {
    id: string;
    type: 'Demo' | 'Real';
    currency: string;
    token: string;
}

export function useDerivAuth() {
    const [token, setToken] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [accountType, setAccountType] = useState<'Demo' | 'Real' | null>(null);
    const [accountCode, setAccountCode] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [activeLoginId, setActiveLoginId] = useState<string | null>(null);
    const [wsRef, setWsRef] = useState<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>(
        'disconnected'
    );

    // Parse tokens from OAuth redirect URL
    const parseTokensFromURL = (): Account[] => {
        const urlParams = new URLSearchParams(window.location.search);
        const accounts: Account[] = [];

        // Parse acct1/token1/cur1, acct2/token2/cur2, etc.
        for (let i = 1; i <= 10; i++) {
            const acct = urlParams.get(`acct${i}`);
            const token = urlParams.get(`token${i}`);
            const cur = urlParams.get(`cur${i}`);

            if (acct && token && cur) {
                accounts.push({
                    id: acct,
                    token: token,
                    currency: cur.toUpperCase(),
                    type: acct.includes('VR') || acct.includes('VRTC') ? 'Demo' : 'Real',
                });
            }
        }

        console.log('[OAuth] Parsed', accounts.length, 'accounts from URL');
        return accounts;
    };

    // OAuth login - redirect to Deriv
    const loginWithDeriv = () => {
        if (typeof window === 'undefined') return;

        const redirectUri = encodeURIComponent(window.location.href.split('?')[0]);
        const oauthUrl = `${DERIV_API.OAUTH}?app_id=${DERIV_CONFIG.APP_ID}&redirect_uri=${redirectUri}`;

        console.log('[OAuth] Redirecting to:', oauthUrl);
        window.location.href = oauthUrl;
    };

    // Connect WebSocket and authorize
    const connectAndAuthorize = (accountToken: string, accountId: string) => {
        if (wsRef) {
            console.log('[WebSocket] Closing existing connection');
            wsRef.close();
        }

        setConnectionStatus('connecting');
        console.log('[WebSocket] Connecting to:', `${DERIV_API.WEBSOCKET}?app_id=${DERIV_CONFIG.APP_ID}`);

        const ws = new WebSocket(`${DERIV_API.WEBSOCKET}?app_id=${DERIV_CONFIG.APP_ID}`);

        ws.onopen = () => {
            console.log('[WebSocket] Connected, authorizing...');
            ws.send(JSON.stringify({ authorize: accountToken }));
        };

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);

            if (data.error) {
                console.error('[WebSocket] Error:', data.error.message);
                if (data.error.code === 'InvalidToken') {
                    console.log('[WebSocket] Invalid token, clearing and re-authenticating');
                    localStorage.removeItem('deriv_accounts');
                    localStorage.removeItem('deriv_active_token');
                    localStorage.removeItem('deriv_active_login_id');
                    setConnectionStatus('disconnected');
                    loginWithDeriv();
                }
                return;
            }

            // Handle authorize response
            if (data.msg_type === 'authorize' && data.authorize) {
                const { authorize } = data;
                const accType = authorize.is_virtual ? 'Demo' : 'Real';

                console.log('[Auth] Success!');
                console.log('[Auth] Account:', authorize.loginid, `(${accType})`);
                console.log('[Auth] Balance:', authorize.balance, authorize.currency);

                setConnectionStatus('connected');
                setAccountType(accType);
                setActiveLoginId(authorize.loginid);
                setAccountCode(authorize.loginid);
                setIsLoggedIn(true);
                setToken(accountToken);

                // Set balance
                const balanceData = {
                    amount: authorize.balance,
                    currency: authorize.currency,
                };
                setBalance(balanceData);

                // Subscribe to balance updates
                ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
                console.log('[WebSocket] Balance subscription started');
            }

            // Handle balance updates
            if (data.msg_type === 'balance' && data.balance) {
                console.log('[Balance] Update:', data.balance.balance, data.balance.currency);
                const balanceData = {
                    amount: data.balance.balance,
                    currency: data.balance.currency,
                };
                setBalance(balanceData);
            }
        };

        ws.onerror = (error) => {
            console.error('[WebSocket] Connection error:', error);
            setConnectionStatus('disconnected');
        };

        ws.onclose = () => {
            console.log('[WebSocket] Connection closed');
            setConnectionStatus('disconnected');
        };

        setWsRef(ws);

        return () => {
            ws.close();
        };
    };

    // Switch account
    const switchAccount = (loginId: string) => {
        const account = accounts.find((acc) => acc.id === loginId);
        if (!account) {
            console.error('[Switch] Account not found:', loginId);
            return;
        }

        console.log('[Switch] Switching to:', loginId);
        localStorage.setItem('deriv_active_token', account.token);
        localStorage.setItem('deriv_active_login_id', loginId);

        connectAndAuthorize(account.token, loginId);
    };

    // Logout
    const logout = () => {
        console.log('[Auth] Logging out');
        if (wsRef) {
            wsRef.close();
        }
        localStorage.removeItem('deriv_accounts');
        localStorage.removeItem('deriv_active_token');
        localStorage.removeItem('deriv_active_login_id');
        setIsLoggedIn(false);
        setToken('');
        setBalance(null);
        setAccountType(null);
        setAccountCode('');
        setActiveLoginId(null);
        setAccounts([]);
        setConnectionStatus('disconnected');
    };

    // Initialize auth on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check for OAuth redirect with tokens
        const urlAccounts = parseTokensFromURL();

        if (urlAccounts.length > 0) {
            console.log('[OAuth] Found tokens in URL, saving...');

            // Save accounts
            localStorage.setItem('deriv_accounts', JSON.stringify(urlAccounts));
            setAccounts(urlAccounts);

            // Use first account by default
            const firstAccount = urlAccounts[0];
            localStorage.setItem('deriv_active_token', firstAccount.token);
            localStorage.setItem('deriv_active_login_id', firstAccount.id);

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Connect and authorize
            connectAndAuthorize(firstAccount.token, firstAccount.id);
            return;
        }

        // Check for stored session
        const storedAccounts = localStorage.getItem('deriv_accounts');
        const storedToken = localStorage.getItem('deriv_active_token');
        const storedLoginId = localStorage.getItem('deriv_active_login_id');

        if (storedAccounts && storedToken && storedLoginId) {
            console.log('[Auth] Found stored session');
            const parsedAccounts = JSON.parse(storedAccounts);
            setAccounts(parsedAccounts);
            connectAndAuthorize(storedToken, storedLoginId);
        } else {
            console.log('[Auth] No session found, login required');
            // Auto-redirect to login
            loginWithDeriv();
        }

        return () => {
            if (wsRef) {
                wsRef.close();
            }
        };
    }, []);

    return {
        isLoggedIn,
        token,
        balance,
        accountType,
        accountCode,
        accounts,
        activeLoginId,
        connectionStatus,
        loginWithDeriv,
        switchAccount,
        logout,
    };
}
