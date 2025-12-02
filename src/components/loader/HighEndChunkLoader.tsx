import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './high-end-chunk-loader.scss';
import { Twitter, Send } from 'lucide-react';
import { DerivLogo } from '@deriv-com/ui';

// If available, import existing websocket manager singleton
// Use a local temporary WebSocket check to avoid importing heavy project modules at the top-level of this loader.
// We'll try to connect to Deriv WS directly for status checks.

export type LoaderPhase = 'idle' | 'connecting' | 'authenticating' | 'loading' | 'ready' | 'error';

interface HighEndChunkLoaderProps {
    message?: string;
    forcedHide?: boolean; // optional override when parent wants to hide loader
}

export default function HighEndChunkLoader({ message, forcedHide }: HighEndChunkLoaderProps) {
    const [visible, setVisible] = useState(true);
    const [phase, setPhase] = useState<LoaderPhase>('idle');
    const [progress, setProgress] = useState(6); // initial tiny progress
    const progressRef = useRef<number>(6);
    const animateTickRef = useRef<number | null>(null);
    const mounted = useRef(true);

    const phaseMessage = useMemo(() => {
        switch (phase) {
            case 'idle':
                return 'Preparing app...';
            case 'connecting':
                return 'Connecting to Deriv…';
            case 'authenticating':
                return 'Authenticating…';
            case 'loading':
                return 'Loading components…';
            case 'ready':
                return 'Getting your account ready…';
            case 'error':
                return 'Connection issue — retrying…';
            default:
                return 'Loading…';
        }
    }, [phase]);

    const startAnimationLoop = useCallback(() => {
        if (animateTickRef.current) return;
        const tick = () => {
            // Ease progress to the next state
            progressRef.current = Math.min(100, progressRef.current + Math.random() * 5 + 0.5);
            setProgress(Math.round(progressRef.current));

            // smooth complete when phase is 'ready'
            if (phase === 'ready' && progressRef.current < 100) {
                progressRef.current = Math.min(100, progressRef.current + 8);
                setProgress(Math.round(progressRef.current));
            }

            animateTickRef.current = window.requestAnimationFrame(tick);
        };
        animateTickRef.current = window.requestAnimationFrame(tick);
    }, [phase]);

    const stopAnimationLoop = useCallback(() => {
        if (animateTickRef.current) {
            window.cancelAnimationFrame(animateTickRef.current);
            animateTickRef.current = null;
        }
    }, []);

    // Auto-hide logic when ready
    useEffect(() => {
        if (forcedHide) {
            setTimeout(() => setVisible(false), 0);
            return;
        }

        if (phase === 'ready' && progress >= 99) {
            // Fade out after a short delay
            const t = setTimeout(() => {
                setVisible(false);
            }, 450);
            return () => clearTimeout(t);
        }
    }, [phase, progress, forcedHide]);

    // Start the loader lifecycle
    useEffect(() => {
        mounted.current = true;
        let wsConnected = false;

        async function beginLifecycle() {
            try {
                setPhase('connecting');
                startAnimationLoop();

                // Try a safe, short-lived websocket connection to Deriv to check connectivity.
                // Use a 5-second timeout to detect quick failures.
                const wsUrl = 'wss://ws.derivws.com/websockets/v3?app_id=106629';
                function checkWsConnection(timeout = 5000) {
                    return new Promise<boolean>(resolve => {
                        let done = false;
                        let ws: WebSocket | null = null;
                        try {
                            ws = new WebSocket(wsUrl);
                        } catch (err) {
                            resolve(false);
                            return;
                        }

                        const cleanup = () => {
                            if (ws) {
                                try {
                                    ws.close();
                                } catch (e) {}
                                ws = null;
                            }
                        };

                        const onSuccess = () => {
                            if (done) return;
                            done = true;
                            cleanup();
                            resolve(true);
                        };

                        const onFail = () => {
                            if (done) return;
                            done = true;
                            cleanup();
                            resolve(false);
                        };

                        ws.onopen = onSuccess;
                        ws.onerror = onFail;
                        ws.onclose = () => {
                            if (!done) {
                                onFail();
                            }
                        };

                        setTimeout(() => {
                            if (!done) onFail();
                        }, timeout);
                    });
                }

                wsConnected = await checkWsConnection(4500);

                if (!mounted.current) return;

                if (wsConnected) {
                    setPhase('authenticating');
                    // small pause to simulate authentication progress if any
                    await new Promise(res => setTimeout(res, 700));

                    // If there is an authorize step, we could check if token is present
                    // For security reasons it depends on main flow; we will just progress
                    setPhase('loading');

                    // Simulate loading of JS chunks and components; we can observe promises via import.meta or window events,
                    // but for a chunk loader we'll rely on Suspense to hide it via render path and also on a max timeout / connectivity.
                    // Start a small poll to move progress to near completion
                    await new Promise(res => setTimeout(res, 850));

                    if (derivWebSocket && typeof derivWebSocket.isConnected === 'function') {
                        // Wait for auth or for readiness if needed
                        // Optionally check a message
                        // Keep authenticated if connection is open
                    }

                    setPhase('ready');
                } else {
                    setPhase('error');
                    // Try a reconnect loop
                    const tryReconnect = async () => {
                        let attempts = 0;
                        while (attempts < 5 && mounted.current) {
                            attempts += 1;
                            try {
                                if (derivWebSocket && typeof derivWebSocket.connect === 'function') {
                                    await derivWebSocket.connect();
                                    if (derivWebSocket.isConnected()) return true;
                                } else return true;
                            } catch (e) {
                                // backoff
                                await new Promise(r => setTimeout(r, 800 * attempts));
                            }
                        }
                        return false;
                    };

                    const ok = await tryReconnect();
                    if (ok) setPhase('authenticating');
                }
            } catch (e) {
                setPhase('error');
            }
        }

        beginLifecycle();

        return () => {
            mounted.current = false;
            stopAnimationLoop();
        };
    }, [startAnimationLoop, stopAnimationLoop]);

    // In case we want to force hide on unmount or after a period
    useEffect(() => {
        let t: number | null = null;
        if (!visible) {
            t = window.setTimeout(() => setVisible(false), 300);
        }
        return () => {
            if (t) window.clearTimeout(t);
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <div
            className={`he-chunk-loader ${visible ? 'he-chunk-loader--visible' : ''}`}
            role='status'
            aria-live='polite'
        >
            <div className='he-chunk-loader__bg'>
                <div className='he-chunk-loader__particles' aria-hidden='true' />
            </div>

            <div className='he-chunk-loader__card'>
                <div className='he-chunk-loader__logo-wrap'>
                    <div className='he-chunk-loader__logo-ring'>
                        <div className='he-chunk-loader__ring' />
                        <div className='he-chunk-loader__ring he-chunk-loader__ring--inner' />
                    </div>
                    <div className='he-chunk-loader__logo'>
                        <DerivLogo height='40px' />
                    </div>
                </div>

                <h1 className='he-chunk-loader__title'>
                    <span className='he-chunk-loader__title-main'>ProfiHub</span>
                    <span className='he-chunk-loader__title-underline' aria-hidden />
                </h1>

                <div className='he-chunk-loader__subtext'>
                    <span>Powered by</span>
                    <a href='https://www.deriv.com' target='_blank' rel='noopener noreferrer'>
                        Deriv
                    </a>
                </div>

                <div className='he-chunk-loader__status'>
                    <div className='he-chunk-loader__status-left'>
                        <div className='he-chunk-loader__status-dot' data-phase={phase} />
                        <div className='he-chunk-loader__status-text'>{phaseMessage}</div>
                    </div>
                    <div className='he-chunk-loader__status-right'>
                        <div className='he-chunk-loader__progress' aria-hidden>
                            <div
                                className='he-chunk-loader__progress-fill'
                                style={{ width: `${Math.min(100, progress)}%` }}
                            />
                        </div>
                        <div className='he-chunk-loader__progress-percent'>{Math.min(100, progress)}%</div>
                    </div>
                </div>

                {/* social row with subtle neon icons */}
                <div className='he-chunk-loader__socials'>
                    <a
                        className='social-btn social-btn--whatsapp'
                        href='https://wa.me/your-number'
                        aria-label='WhatsApp'
                    >
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                                d='M20.52 3.48A11.93 11.93 0 0012 0C5.373 0 .02 5.353.02 12c0 2.11.55 4.17 1.6 6.02L0 24l6.22-1.63A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.21-3.48-8.52z'
                                fill='currentColor'
                                opacity='0.08'
                            />
                            <path
                                d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.672.15-.198.297-.768.967-.942 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.476-.885-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.672-1.619-.922-2.219-.243-.579-.49-.5-.672-.51l-.573-.01c-.198 0-.52.075-.793.372s-1.04 1.016-1.04 2.479 1.064 2.876 1.213 3.075c.149.198 2.096 3.2 5.077 4.487 0 0 .005.003.007.004.5.216.89.345 1.195.442.503.162.962.139 1.325.084.404-.062 1.24-.506 1.414-.995.174-.49.174-.907.122-.995-.052-.089-.198-.149-.446-.298z'
                                fill='currentColor'
                            />
                        </svg>
                    </a>
                    <a
                        className='social-btn social-btn--x'
                        href='https://twitter.com/yourhandle'
                        aria-label='X (Twitter)'
                    >
                        <Twitter size={14} />
                    </a>
                    <a className='social-btn social-btn--telegram' href='https://t.me/yourhandle' aria-label='Telegram'>
                        <Send size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}
