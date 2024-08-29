import { styled, Stack, Paper } from '@mui/material';

import { Chat } from '@/components/chat';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: '20px 0px',
    height: `calc(100vh - ${theme.spacing(4.5)})`,
    width: `calc(100vw - ${theme.spacing(3)})`,
}));

const StyledPaper = styled(Paper)(() => ({
    height: '100%',
    width: '100%',
}));

export const PlaygroundPage = () => {
    return (
        <Stack alignItems={'center'} justifyContent={'center'}>
            <StyledContainer>
                <StyledPaper variant={'elevation'} elevation={2} square>
                    <Chat />
                </StyledPaper>
            </StyledContainer>
        </Stack>
    );
};
