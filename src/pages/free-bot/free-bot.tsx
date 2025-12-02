import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Localize, localize } from '@deriv-com/translations';
import { LegacyLoaderStartIcon, LegacyPlus1pxIcon } from '@deriv/quill-icons/Legacy';
import { useStore } from '@/hooks/useStore';
import Button from '@/components/shared_ui/button';
import Text from '@/components/shared_ui/text';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import './free-bot.scss';

const FreeBotPage = observer(() => {
    const { free_bot_store } = useStore();
    const { free_bot_strategies, loadFreeBotStrategy, uploadFreeBotFile, is_uploading } = free_bot_store;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFreeBotFile(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className='free-bot-page'>
            <div className='free-bot-page__header'>
                <Text as='h1' size='l' weight='bold'>
                    <Localize i18n_default_text='Bot Strategies Library' />
                </Text>
                <Text as='p' size='s' className='free-bot-page__description'>
                    <Localize i18n_default_text='Ready to deploy • Click to load' />
                </Text>
            </div>

            <div className='free-bot-page__content'>
                <Tabs defaultValue="normal">
                    <TabsList>
                        <TabsTrigger value="normal">{localize('Normal Bots')}</TabsTrigger>
                        <TabsTrigger value="premium">{localize('Premium Bots')}</TabsTrigger>
                        <TabsTrigger value="import">{localize('Import Bot')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="normal">
                        <div className='free-bot-page__bot-list'>
                            {free_bot_strategies
                                .filter(s => !s.isPremium)
                                .map(strategy => (
                                    <div key={strategy.id} className='bot-item'>
                                        <div className='bot-item__left'>
                                            <div className='bot-item__icon'>
                                                <LegacyLoaderStartIcon fill='#fff' width='20px' height='20px' />
                                            </div>
                                            <div className='bot-item__info'>
                                                <div className='bot-item__name'>{strategy.name}</div>
                                                <div className='bot-item__status'>
                                                    <Localize i18n_default_text='Ready to deploy • Click to load' />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            text={localize('Load Bot')}
                                            onClick={() => loadFreeBotStrategy(strategy)}
                                            primary
                                            has_effect
                                            className='bot-item__button'
                                        />
                                    </div>
                                ))}
                            {free_bot_strategies.filter(s => !s.isPremium).length === 0 && (
                                <div className='free-bot-page__empty'>
                                    <Text as='p' size='s' align='center'>
                                        <Localize i18n_default_text='No normal bots available.' />
                                    </Text>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="premium">
                        <div className='free-bot-page__bot-list'>
                            {free_bot_strategies
                                .filter(s => s.isPremium)
                                .map(strategy => (
                                    <div key={strategy.id} className='bot-item bot-item--premium'>
                                        <div className='bot-item__left'>
                                            <div className='bot-item__icon bot-item__icon--premium'>
                                                <LegacyLoaderStartIcon fill='#fff' width='20px' height='20px' />
                                            </div>
                                            <div className='bot-item__info'>
                                                <div className='bot-item__name'>
                                                    {strategy.name}
                                                    <span className='bot-item__badge'>PREMIUM</span>
                                                </div>
                                                <div className='bot-item__status'>
                                                    <Localize i18n_default_text='Ready to deploy • Click to load' />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            text={localize('Load Bot')}
                                            onClick={() => loadFreeBotStrategy(strategy)}
                                            primary
                                            has_effect
                                            className='bot-item__button'
                                        />
                                    </div>
                                ))}
                            {free_bot_strategies.filter(s => s.isPremium).length === 0 && (
                                <div className='free-bot-page__empty'>
                                    <Text as='p' size='s' align='center'>
                                        <Localize i18n_default_text='No premium bots available.' />
                                    </Text>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="import">
                        <div className='free-bot-page__import'>
                            <input
                                type='file'
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept='.xml'
                                style={{ display: 'none' }}
                            />
                            <div className='import-area'>
                                <LegacyPlus1pxIcon width='48px' height='48px' fill='var(--text-general)' />
                                <Text as='p' size='m' weight='bold' align='center'>
                                    <Localize i18n_default_text='Import your bot' />
                                </Text>
                                <Text as='p' size='xs' align='center'>
                                    <Localize i18n_default_text='Upload an XML file to load your strategy' />
                                </Text>
                                <Button
                                    text={is_uploading ? localize('Uploading...') : localize('Select XML File')}
                                    onClick={() => fileInputRef.current?.click()}
                                    primary
                                    has_effect
                                    disabled={is_uploading}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
});

export default FreeBotPage;
