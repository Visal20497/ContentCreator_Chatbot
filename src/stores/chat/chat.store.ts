import { makeAutoObservable, runInAction } from 'mobx';
import { Insight } from '@semoss/sdk';

import { MODEL_KEY, TEMPERATURE, TOKEN_LENGTH } from './chat.constants';
import { ChatRoom } from './chat.room';
import { Model } from './chat.types';

interface ChatStoreInterface {
    /**
     *  Track if the chat is initialized
     */
    isInitialized: boolean;

    /**
     *  Track if the chat is loading
     */
    isLoading: boolean;

    /**
     * Map of id to channel
     */
    rooms: Record<string, ChatRoom>;

    /**
     * Order of the rooms
     */
    order: string[];

    /**
     * Current active room
     */
    activeRoomId: string;

    /**
     * List of the models available
     */
    models: {
        /** All of the models */
        options: Model[];

        /** The current model */
        selected: string;
    };
}

/**
 * Internal state management of the builder object
 */
export class ChatStore {
    private _actions: Insight['actions'];
    private _store: ChatStoreInterface = {
        isInitialized: false,
        isLoading: false,
        rooms: {},
        order: [],
        activeRoomId: '',
        models: {
            options: [],
            selected: '',
        },
    };

    constructor(actions: Insight['actions']) {
        this._actions = actions;

        // make it observable
        makeAutoObservable(this);
    }

    /**
     * Getters
     */
    /**
     * Track if the store is loaded
     */
    get isInitialized() {
        return this._store.isInitialized;
    }

    /**
     * Get an indicator if the chat is loading
     */
    get isLoading() {
        return this._store.isLoading;
    }

    /**
     * Get the rooms from the store
     */
    get rooms() {
        return this._store.rooms;
    }

    /**
     * Get the order of the rooms
     */
    get order() {
        return this._store.order;
    }

    /**
     * Get the active roomId
     */
    get activeRoomId() {
        return this._store.activeRoomId;
    }

    /**
     * Get the active room from the store
     */
    get activeRoom(): ChatRoom | null {
        if (
            !this._store.activeRoomId ||
            !this._store.rooms[this._store.activeRoomId]
        ) {
            return null;
        }

        return this._store.rooms[this._store.activeRoomId];
    }

    /**
     * Get the room from the store
     *
     * @param roomId - message to get
     */
    getRoom(roomId: string): ChatRoom {
        return this._store.rooms[roomId];
    }

    /**
     * Get the active roomId
     */
    get models() {
        return this._store.models;
    }

    /**
     * Get available models from the backend
     */
    async initialize(): Promise<void> {
        try {
            if (this._store.isInitialized) {
                return;
            }

            // set as initialized
            Promise.all([
                // get the room info
                this.getRooms(),
                // get the model info
                this.getModels(),
            ]).finally(() => {
                runInAction(() => {
                    this._store.isInitialized = true;
                });
            });
        } catch (e) {
            console.error(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Open a room
     */
    async openRoom(): Promise<string> {
        try {
            // turn on the loading screen
            this.setIsLoading(true);

            // wait for the pixel to run
            const { errors, pixelReturn } = await this._actions.run<
                [
                    {
                        insightData: {
                            insightID: string;
                        };
                    },
                ]
            >(`OpenUserRoom();`);

            // throw errors
            if (errors.length > 0) {
                throw new Error(errors.join(''));
            }

            // get the output
            const { output } = pixelReturn[0];

            // get the roomId
            const roomId = output.insightData.insightID;

            runInAction(() => {
                // register the room
                const room = new ChatRoom(roomId);

                // store it
                this._store.rooms[roomId] = room;

                // add to the front
                this._store.order.unshift(roomId);

                // set the active room
                this._store.activeRoomId = roomId;
            });

            // return the id
            return roomId;
        } catch (e) {
            console.error(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }

        return '';
    }

    /**
     * Remove an room from the remove and all of the related messages
     * @param roomId - Room to remove
     */
    async closeRoom(roomId: string): Promise<void> {
        try {
            // remove from the order
            const idx = this._store.order.indexOf(roomId);
            if (idx > -1) {
                this._store.order.splice(idx, 1);
            }

            // delete the room
            delete this._store.rooms[roomId];

            // try to go to the previous, otherwise go to the next, otherwise go to first, or null
            if (this._store.activeRoomId === roomId) {
                if (this._store.order[idx - 1]) {
                    this._store.activeRoomId = this._store.order[idx - 1];
                } else if (this._store.order[idx]) {
                    this._store.activeRoomId = this._store.order[idx];
                } else if (this._store.order[0]) {
                    this._store.activeRoomId = this._store.order[0];
                } else {
                    this._store.activeRoomId = '';
                }
            }

            // wait for the pixel to run
            const { errors } = await this._actions.run<[boolean]>(
                `RemoveUserRoom(roomId=["${roomId}"]);`,
            );

            // throw errors
            if (errors.length > 0) {
                throw new Error(errors.join(''));
            }

            return;
        } catch (e) {
            console.error(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Select a room
     *
     * @param activeRoomId - current active room
     */
    selectRoom(activeRoomId: string): void {
        this._store.activeRoomId = activeRoomId;
    }

    /**
     * Helpers
     */
    /**
     * Get the current rooms
     */
    async getRooms(): Promise<void> {
        try {
            // turn on the loading screen
            this.setIsLoading(true);

            // clear the room info
            this._store.rooms = {};
            this._store.order = [];
            this._store.activeRoomId = '';

            // wait for the pixel to run
            const { errors, pixelReturn } = await this._actions.run<
                [
                    {
                        DATE_CREATED: string;
                        ROOM_ID: string;
                        ROOM_NAME: string;
                        MODEL_ID: string;
                    }[],
                ]
            >(`GetUserConversationRooms();`);

            // throw errors
            if (errors.length > 0) {
                throw new Error(errors.join(''));
            }

            // get the output
            const { output } = pixelReturn[0];

            // get the info
            const rooms = {};
            const order = [];

            const promises = [];
            for (const r of output) {
                const room = new ChatRoom(r.ROOM_ID, r.MODEL_ID, {
                    name: r.ROOM_NAME,
                    dateCreated: r.DATE_CREATED,
                });

                // store the rooms
                rooms[r.ROOM_ID] = room;

                // TODO: Laziliy initialize
                // initialize the old rooms
                promises.push(room.initialize(r.MODEL_ID));

                // store the order
                order.push(r.ROOM_ID);
            }

            // wait for the rooms to be loaded
            await Promise.all(promises);

            runInAction(() => {
                // clear the room info
                this._store.rooms = rooms;
                this._store.order = order;
                this._store.activeRoomId = '';
            });
        } catch (e) {
            console.error(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Get available models from the backend
     */
    async getModels(): Promise<void> {
        try {
            // turn on the loading screen
            this.setIsLoading(true);

            // clear the models
            this._store.models = {
                options: [],
                selected: '',
            };

            // wait for the pixel to run
            const { errors, pixelReturn } = await this._actions.run<[Model[]]>(
                `MyEngines ( engineTypes=["MODEL"]);`,
            );

            // throw errors
            if (errors.length > 0) {
                throw new Error(errors.join(''));
            }

            runInAction(() => {
                // get the output
                const { output } = pixelReturn[0];

                // store the models
                this._store.models.options = output.map((m) => ({
                    ...m,
                    app_name: m.app_name ? m.app_name.replace(/_/g, ' ') : '',
                }));

                // track if it was set from one of the options
                let isSelected = false;

                // pull from local storage
                try {
                    if (localStorage) {
                        const storedItem = localStorage.getItem(MODEL_KEY);
                        if (!isSelected && storedItem) {
                            const storedModel = JSON.parse(storedItem);
                            for (const m of this._store.models.options) {
                                if (storedModel === m.app_id) {
                                    this.setSelectedModel(m.app_id);

                                    isSelected = true;

                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                }

                // set the selected one if not there
                if (!isSelected && this._store.models.options.length > 0) {
                    this.setSelectedModel(this._store.models.options[0].app_id);

                    isSelected = true;
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Get available models from the backend
     */
    async setSelectedModel(modelId: string): Promise<void> {
        this.models.selected = modelId;

        // save to local storage
        if (localStorage) {
            localStorage.setItem(
                MODEL_KEY,
                JSON.stringify(this.models.selected),
            );
        }
    }

    /**
     * Set the isLoading boolean
     * @param isLoading - is it loading
     */
    private setIsLoading(isLoading: boolean): void {
        this._store.isLoading = isLoading;
    }
}
