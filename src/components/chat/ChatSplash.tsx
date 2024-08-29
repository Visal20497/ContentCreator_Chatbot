import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    styled,
    Box,
    Container,
    Typography,
    TextField,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import UploadDocument from '../common/UploadDocumentModal/DocumentModal';
import { useChat } from '@/hooks';
import { INSTRUCTIONS, Instructions } from '@/stores';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: theme.spacing(1),
    backgroundColor: 'transparent',
    [theme.breakpoints.down('md')]: {
        paddingTop: theme.spacing(1),
    },
}));

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
}));

const StyledContext = styled(Button)(({ theme }) => ({
    width: '100%',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    color: theme.palette.text.secondary,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.background.paper,
    textAlign: 'left',
}));

const StyledContextText = styled('span', {
    shouldForwardProp: (prop) => prop !== 'custom',
})<{
    custom: boolean;
}>(({ theme, custom }) => ({
    ...theme.typography.body2,
    height: `${2 * 1.43 * 14}px`,
    color: custom
        ? theme.typography.caption.color
        : theme.typography.body2.color,
    lineHeight: custom ? 2 * 1.43 : 1.43,
    fontStyle: custom ? 'italic' : undefined,
    margin: custom ? 'auto' : undefined,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
}));

export const ChatSplash = observer(() => {
    const { chat } = useChat();

    // custom
    const [isCustomOpen, setCustomOpen] = useState(false);
    const [customContext, setCustomContext] = useState('');
    const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

    /**
     * Set the context of a room
     *
     * @param context - context to load
     */
    const fileUploadDialogClose = () => {
        setIsFileUploadOpen(false);
    };

    const setRoomTemplate = async (context: Instructions['context']) => {
        // get the room id
        let roomId = '';
        if (chat.activeRoom) {
            roomId = chat.activeRoom.roomId;
        } else {
            roomId = await chat.openRoom();
        }

        if (!roomId) {
            return;
        }

        // get the room
        const room = chat.getRoom(roomId);

        // initialize the room with an empty context if it isn't
        if (!room.isInitialized) {
            // initialize the room
            const model = JSON.parse(
                localStorage.getItem('SMSS-SELECTED-MODEL'),
            );
            await room.initialize(model, {
                context: context,
            });
        }
    };

    /**
     * Close the Custom Dialog
     * @param save - save the new results
     */
    const closeCustomDialog = async (save: boolean) => {
        // reset the text
        if (!save) {
            setCustomContext('');
        } else {
            // wait for this to be complete
            await setRoomTemplate(customContext);
        }

        // close it
        setCustomOpen(false);
    };
    return (
        <>
            {
                <UploadDocument
                    open={isFileUploadOpen}
                    onClose={fileUploadDialogClose}
                />
            }
            <StyledContainer>
                <Container maxWidth="md">
                    <StyledSectionTitle variant="subtitle2">
                        Examples
                    </StyledSectionTitle>
                    <Box>
                        <Grid container spacing={2}>
                            <Grid xs={12} sm={12} md={4} lg={3}>
                                <Tooltip
                                    title={
                                        'Provide custom instructions to the chat'
                                    }
                                >
                                    <span>
                                        <StyledContext
                                            disabled={!chat.models.selected}
                                            onClick={() => setCustomOpen(true)}
                                        >
                                            <StyledContextText custom={true}>
                                                Custom
                                            </StyledContextText>
                                        </StyledContext>
                                    </span>
                                </Tooltip>
                            </Grid>
                            {INSTRUCTIONS.map((i) => {
                                return (
                                    <Grid
                                        key={i.id}
                                        xs={12}
                                        sm={12}
                                        md={4}
                                        lg={3}
                                    >
                                        <Tooltip title={i.description}>
                                            <span>
                                                <StyledContext
                                                    disabled={
                                                        !chat.models.selected
                                                    }
                                                    onClick={() => {
                                                        setRoomTemplate(
                                                            i.context,
                                                        );
                                                    }}
                                                >
                                                    <StyledContextText
                                                        custom={false}
                                                    >
                                                        {i.description}
                                                    </StyledContextText>
                                                </StyledContext>
                                            </span>
                                        </Tooltip>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                </Container>
            </StyledContainer>
            <Dialog
                open={isCustomOpen}
                onClose={() => closeCustomDialog(false)}
                fullWidth
            >
                <DialogTitle>Custom Instructions</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Context"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => closeCustomDialog(false)}
                        variant={'text'}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => closeCustomDialog(true)}
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});
