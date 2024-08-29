import { atom } from 'recoil';
import { ChatRoomType, MessagePattern } from '@/lib/types';
import type { CheckedState } from '@radix-ui/react-checkbox';

export const messageLog = atom<MessagePattern[]>({
    key: 'message_log',
    default: [],
});

export const chatRoomsState = atom<ChatRoomType[]>({
    key: 'chat_rooms',
    default: [],
});

export const activeRoomIdState = atom<string>({
    key: 'active_room_id',
    default: '',
});

export const newRoomState = atom<boolean>({
    key: 'new_room_state',
    default: false,
});
export const searchInKnowlegeBaseState = atom<CheckedState>({
    key: 'search_in_KnowledgeBase',
    default: false,
});

// export const searchInKnowlegeBaseState = atom<CheckedState>({
//     key: 'search_in_KnowledgeBase',
//     default: false,
// });
