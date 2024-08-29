import { makeAutoObservable, runInAction } from 'mobx';
import { runPixel, partial } from '@semoss/sdk';

import { ChatMessage } from './chat.message';
import { NumberOfQuery, TEMPERATURE, TOKEN_LENGTH } from './chat.constants';

export interface ChatRoomInterface {
    /**
     * ID of the room
     */
    roomId: string;

    /**
     *  Track if the room is initialized
     */
    isInitialized: boolean;

    /**
     *  Track if the room is loading
     */
    isLoading: boolean;

    /**
     *  Track if the room has errored
     */
    error: Error | null;

    /**
     * Metadata associated with the room
     */
    metadata: {
        /**
         * Name of the room
         */
        name: string;

        /**
         * date the room was created
         */
        dateCreated: string;
    };

    /*
     * Model that is being chatted against
     */
    modelId: string;

    /**
     *  Log of messages
     */
    log: ChatMessage[];

    /*
     * Context that is passed to the model
     */
    options: {
        NumberOfQuery: number;
        /*
         * Prompt that is passed to the model
         */
        prompt: string;

        /*
         * Context that is passed to the model
         */
        context: string;

        /*
         * Length of the token
         */
        tokenLength: number;

        /*
         * Temperature of the model
         */
        temperature: number;
    };
}

/**
 * Internal state management of the builder object
 */
export class ChatRoom {
    private _store: ChatRoomInterface = {
        roomId: '',
        isInitialized: false,
        isLoading: false,
        error: null,
        metadata: {
            name: '',
            dateCreated: '',
        },
        modelId: '',
        options: {
            prompt: '',
            context: '',
            tokenLength: TOKEN_LENGTH,
            temperature: TEMPERATURE,
            NumberOfQuery: NumberOfQuery,
        },
        log: [],
    };

    constructor(
        roomId: string,
        modelId?: string,
        metadata?: Partial<ChatRoomInterface['metadata']>,
    ) {
        // register the roomId
        this._store.roomId = roomId;
        this._store.modelId = modelId;

        // register the options
        if (metadata) {
            if (metadata.name) {
                this._store.metadata.name = metadata.name;
            }

            if (metadata.dateCreated) {
                this._store.metadata.dateCreated = metadata.dateCreated;
            }
        }

        // make it observable
        makeAutoObservable(this);
    }

    /**
     * Getters
     */
    /**
     * Get the id of the roomId
     */
    get roomId() {
        return this._store.roomId;
    }

    /**
     * Indicator to chack if it is ready for use
     */
    get isInitialized() {
        return this._store.isInitialized;
    }

    /**
     * Indicator to check if the room is loading
     */
    get isLoading() {
        return this._store.isLoading;
    }

    /**
     * Get the error message if it errored
     */
    get error() {
        return this._store.error;
    }

    /**
     * Metadata associated with the room
     */
    get metadata() {
        return this._store.metadata;
    }

    /**
     * Model that the user is interacting with
     */
    get modelId() {
        return this._store.modelId;
    }

    /**
     * Get the options of the room
     */
    get options() {
        return this._store.options;
    }

    /**
     * Get the log of the room
     */
    get log() {
        return this._store.log;
    }

    /** Actions */
    /**
     * Initialize the room
     *  @param model - model to initialize the room with
     *  @param options - options to initialize in the room
     */
    async initialize(
        modelId: string,
        options: Partial<ChatRoomInterface['options']> = {},
    ) {
        try {
            // cannot set model if initialized
            if (this._store.isInitialized) {
                console.error('Room is initialized');
                return;
            }

            // set the model
            this._store.modelId = modelId;

            // merge the options in
            this._store.options = {
                ...this._store.options,
                ...options,
            };

            // turn on the loading screen
            this.setIsLoading(true);

            // wait for the pixel to run
            const { errors, pixelReturn } = await runPixel<
                [
                    {
                        RATING: any;
                        DATE_CREATED: string;
                        MESSAGE_TYPE: string;
                        MESSAGE_DATA: string;
                        MESSAGE_ID: string;
                    }[],
                ]
            >(
                `GetRoomMessages(roomId=["${this._store.roomId}"]);`,
                this._store.roomId,
            );

            // throw errors
            if (errors.length > 0) {
                throw new Error(errors.join(''));
            }
            const { output } = pixelReturn[0];
            for (const r of output) {
                // create a new message
                const m = new ChatMessage({
                    messageId: r.MESSAGE_ID || '',
                    input: r.MESSAGE_TYPE === 'INPUT' ? 'user' : 'agent',
                    content: r.MESSAGE_DATA,
                    rating: r.RATING !== undefined ? r.RATING : null,
                });

                // save it
                this.saveMessage(m);
            }
            runInAction(() => {
                // initialize it
                this._store.isInitialized = true;
            });
        } catch (e) {
            /**
             * Log it
             */
            console.error(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Send a new user message and recieve a response
     * @param input - user message
     */
    async askModel(
        input: string,
        context: any,
        prompt: any,
        index: any,
    ): Promise<void> {
        // track if it is collecting
        let isCollecting = false;

        /**
         * Collect information for a messgae
         * @param message - message to collect
         */
        const collectMessage = async (message: ChatMessage) => {
            // only continue if active
            if (!isCollecting) {
                return;
            }

            // get the output
            try {
                const output = await partial(this._store.roomId);

                // add the martian
                if (output.message && output.message.new) {
                    message.addToTypewriter(output.message.new);
                }

                // set the next one
                setTimeout(() => collectMessage(message), 1000);
            } catch (e) {
                // noop
            }
        };

        try {
            if (!this._store.modelId) {
                console.error('Model needs to be set. ModelId is required');
                return;
            }

            // turn on the loading screen
            this.setIsLoading(true);

            // build the userContent
            const userContent = input;

            // build the context if it is there
            const defaultContext = this._store.options.context;

            // create a new message

            if (!prompt.includes('regenerate')) {
                const userMessage = new ChatMessage({
                    messageId: '',
                    input: 'user',
                    content: userContent,
                    rating: null,
                });

                // save the message
                this.saveMessage(userMessage);
            }
            if (prompt.includes('regenerate')) {
                const existMessages = this._store.log.filter(
                    (item, Itemindex) => {
                        if (Itemindex !== index) {
                            return item;
                        }
                    },
                );
                this.updateMessages(existMessages);
            }
            // create a new message
            const agentMessage = new ChatMessage({
                messageId: '',
                input: 'agent',
                content: '',
                rating: null,
            });

            // save the message
            this.saveMessage(agentMessage);

            // reset the typewriter
            agentMessage.resetTypewriter('');

            // start collecting
            isCollecting = true;

            // initial delay collecting the partial
            setTimeout(() => collectMessage(agentMessage), 500);
            let sentence = '';
            // if (context) {
            //     sentence = `LLM(engine=["${
            //         this._store.modelId
            //     }"], command=["<encode>${userContent}</encode>"], context=["<encode>${context}</encode>"], paramValues=[${JSON.stringify(
            //         {
            //             max_new_tokens: this._store.options.tokenLength || 2000,
            //             temperature: this._store.options.temperature || 0.4,
            //         },
            //     )}])`;
            // } else {
            //     sentence = `LLM(engine=["${
            //         this._store.modelId
            //     }"], command=["<encode>${userContent}</encode>"], paramValues=[${JSON.stringify(
            //         {
            //             max_new_tokens: this._store.options.tokenLength || 2000,
            //             temperature: this._store.options.temperature || 0.4,
            //         },
            //     )}])`;
            // }
            if (
                index.length == 0 &&
                prompt.length == 0 &&
                context.length == 0
            ) {
                let model = JSON.parse(
                    localStorage.getItem('SMSS-SELECTED-MODEL'),
                );
                const { errors, pixelReturn } = await runPixel<
                    [{ response: string; messageId: string }]
                >(
                    `LLM(engine=["${model}"],
                    ${
                        defaultContext
                            ? `context=["<encode>${defaultContext}</encode>"],`
                            : ''
                    } command=["<encode>${userContent}</encode>"], paramValues=[${JSON.stringify(
                        {
                            max_new_tokens: this._store.options.tokenLength,
                            temperature: this._store.options.temperature,
                        },
                    )}]);`,
                    this._store.roomId,
                );
                // stop collecting
                isCollecting = false;

                // throw errors
                if (errors.length > 0) {
                    throw new Error(errors.join(''));
                }

                // get the output
                const { output } = pixelReturn[0];

                // update the id
                agentMessage.updateId(output.messageId);

                // finish based on the full response
                agentMessage.finishTypewriter(output.response);
            } else {
                let model = JSON.parse(
                    localStorage.getItem('SMSS-SELECTED-MODEL'),
                );
                sentence = `
                    LLM(engine=["${model}"] ,command=["<encode> ${input}</encode>"], context=["<encode>${prompt} ${defaultContext} ${context}</encode>"], paramValues=[${JSON.stringify(
                    {
                        max_new_tokens: this._store.options.tokenLength,
                        temperature: this._store.options.temperature,
                    },
                )}])
                    `;

                // wait for the pixel to run
                const { errors, pixelReturn } = await runPixel<
                    [{ response: string; messageId: string }]
                >(`${sentence}`, this._store.roomId);
                // stop collecting
                isCollecting = false;

                // throw errors
                if (errors.length > 0) {
                    throw new Error(errors.join(''));
                }

                // get the output
                const { output } = pixelReturn[0];

                // update the id
                agentMessage.updateId(output.messageId);

                // finish based on the full response
                agentMessage.finishTypewriter(output.response);
            }
        } catch (e) {
            this.setError(e);
        } finally {
            // stop the collecting
            isCollecting = false;

            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Set the context
     * @param context - context
     */
    async setOptions(options: Partial<ChatRoomInterface['options']>) {
        // merge the options in
        this._store.options = {
            ...this._store.options,
            ...options,
        };
    }

    /**
     *
     * @param messageId
     * @param rating
     * @param text
     */
    async recordFeedback(
        messageId: string,
        rating: boolean,
        text = '',
    ): Promise<void> {
        try {
            // wait for the pixel to run
            const { errors, pixelReturn } = await runPixel<
                [{ response: string; messageId: string }]
            >(
                `SubmitLlmFeedback(messageId = ["${messageId}"], feedbackText=["${text}"], rating=[${rating}]);`,
                this._store.roomId,
            );

            // throw errors
            if (errors.length > 0) {
                throw new Error(errors.join(''));
            }

            // get the output
            const { output } = pixelReturn[0];

            console.log(output);
        } catch (e) {
            this.setError(e);
        } finally {
            // turn off the loading screen
            this.setIsLoading(false);
        }
    }

    /**
     * Helpers
     */

    /**
     * Save a message in the chat
     * @param message - message
     */
    private saveMessage(message: ChatMessage): void {
        // add to the user message
        this._store.log.push(message);
    }
    private updateMessages(messages: any): void {
        this._store.log = messages;
    }

    /**
     * Set the isLoading boolean
     * @param isLoading - is it loading
     */
    private setIsLoading(isLoading: boolean): void {
        this._store.isLoading = isLoading;
    }

    /**
     * Set the error
     * @param error - error
     */
    private setError(error: Error | null): void {
        this._store.error = error;

        // log the error
        console.error(error);
    }
}
