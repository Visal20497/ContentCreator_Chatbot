import { useState } from 'react';
import './style.css';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import { Instructions, prompts } from '@/stores';
import { useChat } from '@/hooks';

const StyledContext = styled(Button)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    border: '1px solid black',
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

function ShowPrompts(props) {
    const { onClose, isShowPromptsOpen, ShowPromptsClose, setInput, input } =
        props;
    const [customContext, setCustomContext] = useState('');
    const [isCustomOpen, setCustomOpen] = useState(false);
    const { chat } = useChat();
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
            <Dialog
                className="upload-container"
                onClose={ShowPromptsClose}
                open={isShowPromptsOpen}
            >
                <DialogTitle className="dialogTitle">
                    Suggested Prompts
                </DialogTitle>
                <Box sx={{ px: 3 }}>
                    <Grid container className="gird_container">
                        {prompts.map((i) => {
                            return (
                                <Grid
                                    key={i.id}
                                    item
                                    xs={6}
                                    sm={6}
                                    md={6}
                                    lg={6}
                                    sx={{
                                        padding: '6px',
                                    }}
                                >
                                    <Tooltip title={i.title}>
                                        <span>
                                            <StyledContext
                                                disabled={!chat.models.selected}
                                                onClick={() => {
                                                    setInput(i.description);
                                                    ShowPromptsClose();
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
                <Divider></Divider>
                <DialogActions>
                    <Button variant="outlined" onClick={ShowPromptsClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isCustomOpen} onClose={() => setCustomOpen(false)}>
                <DialogTitle>Custom Prompt</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="customContext"
                        label="Custom Context"
                        type="text"
                        fullWidth
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => closeCustomDialog(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => closeCustomDialog(true)}
                        color="primary"
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ShowPrompts;
