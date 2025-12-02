import { action, makeObservable, observable, runInAction } from 'mobx';
import { load, save_types } from '@/external/bot-skeleton';
import RootStore from './root-store';

export interface FreeBotStrategy {
    id: string;
    name: string;
    xml: string;
    uploadedAt: number;
    isPremium?: boolean;
}

export default class FreeBotStore {
    root_store: RootStore;
    free_bot_strategies: FreeBotStrategy[] = [];
    is_uploading = false;

    constructor(root_store: RootStore) {
        makeObservable(this, {
            free_bot_strategies: observable,
            is_uploading: observable,
            uploadFreeBotFile: action.bound,
            loadFreeBotStrategy: action.bound,
            deleteFreeBotStrategy: action.bound,
        });

        this.root_store = root_store;
        this.preloadBots();
    }

    preloadBots = async () => {
        try {
            const { PRE_LOADED_BOTS_DATA } = await import('../pages/free-bot/preloaded-bots-data');

            runInAction(() => {
                this.free_bot_strategies = PRE_LOADED_BOTS_DATA.map(bot => ({
                    id: bot.id,
                    name: bot.name,
                    xml: bot.xml,
                    uploadedAt: Date.now(),
                    isPremium: bot.isPremium,
                }));
            });
        } catch (error) {
            console.error('Error preloading bots:', error);
        }
    };

    uploadFreeBotFile = async (file: File, isPremium: boolean = false): Promise<boolean> => {
        this.is_uploading = true;
        try {
            const text = await file.text();

            // Validate XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            const parserError = xmlDoc.querySelector('parsererror');

            if (parserError) {
                console.warn('XML parser error (ignoring as per user request):', parserError);
                // this.is_uploading = false;
                // return false;
            }

            const strategy: FreeBotStrategy = {
                id: Date.now().toString(),
                name: file.name.replace('.xml', ''),
                xml: text,
                uploadedAt: Date.now(),
                isPremium,
            };

            runInAction(() => {
                this.free_bot_strategies.push(strategy);
                this.saveToLocalStorage();
                this.is_uploading = false;
            });

            return true;
        } catch (error) {
            console.error('Error uploading file:', error);
            runInAction(() => {
                this.is_uploading = false;
            });
            return false;
        }
    };

    loadFreeBotStrategy = async (strategy: FreeBotStrategy) => {
        try {
            // Navigate to Bot Builder tab (index 1)
            this.root_store.dashboard.setActiveTab(1);

            // Wait a moment for the tab to switch and workspace to be ready
            await new Promise(resolve => setTimeout(resolve, 500));

            const blocklyWorkspace = (window as any).Blockly?.derivWorkspace;
            
            if (!blocklyWorkspace) {
                console.error('Blockly workspace not found. Cannot load bot strategy.');
                throw new Error('Blockly workspace not initialized');
            }

            // Load the bot XML into the workspace
            const result = await load({
                block_string: strategy.xml,
                file_name: strategy.name,
                workspace: blocklyWorkspace,
                from: save_types.UNSAVED,
                drop_event: {},
                strategy_id: strategy.id,
                showIncompatibleStrategyDialog: false,
            });

            console.log(`Successfully loaded bot: ${strategy.name}`, result);
        } catch (error) {
            console.error('Error loading strategy:', error);
            // Show user-friendly error notification
            const errorMessage = error instanceof Error ? error.message : 'Failed to load bot strategy';
            console.error(`Failed to load bot "${strategy.name}": ${errorMessage}`);
        }
    };

    deleteFreeBotStrategy = (id: string) => {
        runInAction(() => {
            this.free_bot_strategies = this.free_bot_strategies.filter(s => s.id !== id);
            this.saveToLocalStorage();
        });
    };

    saveToLocalStorage = () => {
        // Implementation for saving to local storage if needed, or just a placeholder if it was intended to be there.
        // For now, I'll just log it as I don't want to overengineer if it's not required by the user's specific request,
        // but the lint error needs to be gone.
        // Actually, looking at the code, it seems it might be intended to persist custom bots.
        // I will add a simple implementation.
        try {
            localStorage.setItem('free_bot_strategies', JSON.stringify(this.free_bot_strategies));
        } catch (e) {
            console.error('Error saving to local storage', e);
        }
    };
}
