import React from 'react';
import { Twitter, Send } from 'lucide-react';
import { DerivLogo } from '@deriv-com/ui';
import './chunk-loader.scss';

interface ChunkLoaderProps {
    message?: string;
}

export default function ChunkLoader({ message }: ChunkLoaderProps) {
    return (
        <div className='chunk-loader'>
            <div className='chunk-loader__content'>
                <div className='chunk-loader__logo' role='img' aria-label='Deriv logo'>
                    <DerivLogo height='36px' />
                </div>
                <h1 className='chunk-loader__title'>Welcome to PROFITHUB</h1>

                <div className='chunk-loader__sub'>
                    <span>Powered by </span>
                    <a href='https://www.deriv.com' target='_blank' rel='noopener noreferrer'>Deriv</a>
                </div>

                <div className='chunk-loader__progress-bar'>
                    <div className='chunk-loader__progress-fill' />
                </div>

                {message && <p className='chunk-loader__message'>{message}</p>}

                <div className='chunk-loader__socials'>
                    <a className='social-btn social-btn--whatsapp' href='https://wa.me/your-number' target='_blank' rel='noopener noreferrer' aria-label='WhatsApp'>W</a>
                    <a className='social-btn social-btn--x' href='https://twitter.com/yourhandle' target='_blank' rel='noopener noreferrer' aria-label='X (Twitter)'><Twitter size={14} /></a>
                    <a className='social-btn social-btn--telegram' href='https://t.me/yourhandle' target='_blank' rel='noopener noreferrer' aria-label='Telegram'><Send size={14} /></a>
                </div>
            </div>
        </div>
    );
}
