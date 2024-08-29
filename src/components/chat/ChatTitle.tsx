import React from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, Typography } from '@mui/material';

export const ChatTitle = observer(() => {
    return (
        <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <Typography variant={'subtitle2'} component={'h6'}>
                RAG Chatbot
            </Typography>
        </Stack>
    );
});
