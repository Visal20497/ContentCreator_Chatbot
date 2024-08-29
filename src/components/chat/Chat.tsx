import { useMemo } from 'react';
import { useInsight } from '@semoss/sdk-react';

import { ChatStore } from '@/stores';
import { ChatContext } from '@/contexts';

import { ChatContent } from './ChatContent';

export const Chat = (): JSX.Element => {
    // get the insight
    const { actions } = useInsight();

    // set up the store
    const chat = useMemo(() => {
        const store = new ChatStore(actions);

        // initialize it
        store.initialize();

        return store;
    }, [actions]);

    return (
        <ChatContext.Provider
            value={{
                chat: chat,
            }}
        >
            <ChatContent />
        </ChatContext.Provider>
    );
};
