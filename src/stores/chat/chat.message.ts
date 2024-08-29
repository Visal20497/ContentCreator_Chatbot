import { makeAutoObservable } from 'mobx';

// speed of the typewriter
const TYPEWRITER_SPEED = 0;

export interface ChatMessageInterface {
    /**
     * Id of the message
     */
    messageId: string;

    /**
     * The type of the message (was it entered by the agent or user)
     */
    input: 'agent' | 'user';

    /**
     * Content to render in the message
     */
    content: string;
    // this is for the rating the message
    rating: any;
}

/**
 * Internal state management of the builder object
 */
export class ChatMessage {
    private _store: ChatMessageInterface = {
        messageId: '',
        input: 'agent',
        content: '',
        rating: null,
    };
    private _typewriter = {
        isActive: false,
        pos: 0,
        full: '',
    };

    constructor(options: {
        messageId: ChatMessageInterface['messageId'];
        input: ChatMessageInterface['input'];
        content: ChatMessageInterface['content'];
        rating: ChatMessage['rating'];
    }) {
        // set the options
        this._store.messageId = options.messageId;
        this._store.input = options.input;
        this._store.content = options.content;
        this._store.rating = options.rating;

        // make it observable
        makeAutoObservable(this);
    }

    /**
     * Getters
     */
    /**
     * Get the id of the message
     */
    get messageId() {
        return this._store.messageId;
    }

    /**
     * Get the content of the input type
     */
    get input() {
        return this._store.input;
    }

    /**
     * Get the content of the message
     */
    get content() {
        return this._store.content;
    }

    get rating() {
        return this._store.rating;
    }
    get Rating() {
        return this._store.rating;
    }

    /** Actions */
    /**
     * Update the id of the message
     *
     * @param id - id to update
     */
    updateId(id: string) {
        this._store.messageId = id;
    }

    /**
     * Reset the typewriter the typewriter
     * @param content - content to reset to
     */
    resetTypewriter(content: string) {
        // clear out the content if it is the first time
        this._store.content = '';

        // update the typewriter
        this._typewriter.isActive = true;
        this._typewriter.pos = 0;
        this._typewriter.full = content;

        // start ticking
        this.tickTypewriter();
    }

    /**
     * Incrementaly render a chunk of the content
     * @param content - content to render
     */
    addToTypewriter(content: string) {
        // increase the size
        this._typewriter.full += content;

        // activate if not active
        if (this._typewriter.isActive) {
            return;
        }

        // activate it
        this._typewriter.isActive = true;

        // tick
        this.tickTypewriter();
    }

    /**
     * Finish based on the content
     *
     * @param final - final content to render
     */
    finishTypewriter(final: string) {
        // remaining chunk to add
        let remaining = final;

        // get the length of the existing content
        const len = this._typewriter.full.length;

        // if there is content, try to find the remaining that needs to be added
        if (len > 0) {
            // get the start position of the existing content in the final string
            const start = final.indexOf(this._typewriter.full);

            // if the existing content doesn't start at start of the final (0), just use the final
            if (start !== 0) {
                this._store.content = final;
                this._typewriter.isActive = false;
                this._typewriter.pos = 0;
                this._typewriter.full = final;
                return;
            }

            // get the remaining (final - start)
            remaining = final.substring(start + len);
        }

        this.addToTypewriter(remaining);
    }

    /**
     * Continue to render a chunk of code
     */
    private tickTypewriter() {
        if (!this._typewriter.isActive) {
            return;
        }

        if (this._typewriter.pos < this._typewriter.full.length) {
            // add the content
            this._store.content += this._typewriter.full.charAt(
                this._typewriter.pos,
            );

            // increment
            this._typewriter.pos = this._typewriter.pos + 1;
        } else {
            // inactivate
            this._typewriter.isActive = false;
        }

        // check again if active
        if (this._typewriter.isActive) {
            setTimeout(() => {
                this.tickTypewriter();
            }, TYPEWRITER_SPEED);
        }
    }
}
