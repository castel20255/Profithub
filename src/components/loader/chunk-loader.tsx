import React from 'react';
import './chunk-loader.scss';

interface ChunkLoaderProps {
    message?: string;
}

export default function ChunkLoader({ message }: ChunkLoaderProps) {
    return (
        <div className='chunk-loader'>
            <div className='chunk-loader__content'>
                <h1 className='chunk-loader__title'>Profit Hub</h1>
                <div className='chunk-loader__progress-bar'>
                    <div className='chunk-loader__progress-fill' />
                </div>
                {message && <p className='chunk-loader__message'>{message}</p>}
            </div>
        </div>
    );
}
