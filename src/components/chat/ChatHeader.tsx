import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
    styled,
    ButtonGroup,
    IconButton,
    Container,
    Avatar,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    TextField,
} from '@mui/material';
import { Lightbulb, EditOutlined } from '@mui/icons-material';
import { useChat } from '@/hooks';

const StyledMessage = styled('div')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    marginTop: -theme.spacing(0.75),
    width: 32,
    height: 32,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
}));

const StyledContent = styled('div')(({ theme }) => ({
    ...theme.typography.body2,
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
}));

const StyledActionContainer = styled('div')(({ theme }) => ({
    color: theme.palette.text.disabled,
    width: theme.spacing(4),
}));

export const ChatHeader = observer(() => {
    const { chat } = useChat();

    const [isOpen, setIsOpen] = useState(false);

    const [context, setContext] = useState('');

    /**
     * Sync the context with the stored one
     */
    const syncContext = () => {
        const context = chat.activeRoom.options.context;

        // set the settings based on the room
        setContext(context);
    };

    /**
     * Close the Dialog
     * @param save - save the new results
     */
    const closeDialog = (save: boolean) => {
        // reset the settings
        if (!save) {
            syncContext();
        } else {
            // set it as an option
            chat.activeRoom.setOptions({
                context: context,
            });
        }

        // close it
        setIsOpen(false);
    };

    // update the settings when it changes
    useEffect(() => {
        // sync it
        syncContext();
    }, [chat.activeRoom.options.context]);

    // update

    return (
        <>
            <StyledMessage>
                <Container maxWidth="md">
                    <StyledPaper elevation={1}>
                        <StyledAvatar alt="message icon">
                            <Lightbulb />
                        </StyledAvatar>
                        <StyledContent
                            title={
                                chat.activeRoom.options.context ||
                                'No Context Provided. Ask anything or add one'
                            }
                        >
                            {chat.activeRoom.options.context ||
                                'Welcome. Ask me anything.'}
                        </StyledContent>
                        <StyledActionContainer>
                            <ButtonGroup>
                                <Tooltip title="Edit Context">
                                    <IconButton
                                        size="small"
                                        color="inherit"
                                        onClick={() => setIsOpen(true)}
                                    >
                                        <EditOutlined
                                            color="inherit"
                                            fontSize="inherit"
                                        />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>
                        </StyledActionContainer>
                    </StyledPaper>
                </Container>
            </StyledMessage>
            <Dialog open={isOpen} onClose={() => closeDialog(false)} fullWidth>
                <DialogTitle>Edit Context</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Context"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeDialog(false)} variant={'text'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => closeDialog(true)}
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});
