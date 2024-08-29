import { observer } from 'mobx-react-lite';
import './style.css';
import {
    styled,
    Paper,
    CircularProgress,
    Backdrop,
    Stack,
    Button,
    Tooltip,
} from '@mui/material';
import { getChatName } from '../../utils/constant';
import ExitDialog from './ExitDialog';
import { useChat } from '@/hooks';
import { ChatNavigation } from './ChatNavigation';
import { ChatHeader } from './ChatHeader';
import { ChatRenderer } from './ChatRenderer';
import { ChatFooter } from './ChatFooter';
import { ChatSplash } from './ChatSplash';
import { useEffect, useState } from 'react';
import { runPixel } from '@semoss/sdk';
import { PIXELS } from '@/providers/pixels';
import { useKnowledgeBase } from '@/contexts/FilesContext';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(() => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
}));

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
    position: 'absolute',
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.contrastText,
}));

const StyledContent = styled('div')(() => ({
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflow: 'hidden',
}));

const StyledScroll = styled('div')(() => ({
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
    direction: 'rtl',
    transform: 'rotate(180deg)',
}));

const StyledScrollInner = styled('div')(() => ({
    direction: 'ltr',
    transform: 'rotate(180deg)',
}));

const StyledFooter = styled('div')(() => ({
    flexShrink: '0',
}));
const StyledHeaderContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderBottom: '1px solid #C0C0C0',
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
}));

export const ChatContent = observer(() => {
    const { chat } = useChat();
    const [chatName, setChatName] = useState('Chatbot');
    const [showExitDialog, setShowExitDialog] = useState(false);
    const navigate = useNavigate();
    const { knowledgebaseData, setKnowledgebaseData } = useKnowledgeBase();

    /**
     * Set the context of a room
     *
     * @param context - context to load
     */
    useEffect(() => {
        const activeRoom = chat.getRoom(chat.activeRoomId);
        if (activeRoom?.metadata?.name.length > 0) {
            const shortName = getChatName(activeRoom?.metadata?.name);
            setChatName(shortName);
        } else {
            setChatName('Chatbot');
        }
    }, [
        chat.activeRoom,
        chat.isInitialized,
        chat.isLoading,
        chat.activeRoom?.log,
    ]);
    interface Output {
        MS: any;
    }
    interface PixelReturnItem {
        output: Output;
        operationType: string;
    }
    function isPixelReturnItem(obj: any): obj is PixelReturnItem {
        return (
            obj &&
            typeof obj === 'object' &&
            'output' in obj &&
            'operationType' in obj
        );
    }
    function clearSession() {
        const rooms = chat.order.map((item) => {
            return item;
        });

        const uploadedFiles = knowledgebaseData.UploadedFiles.map((item) => {
            return item.fileName;
        });

        onRemove(uploadedFiles);
        rooms.forEach((element) => {
            removeRooms(element);
        });

        setKnowledgebaseData((prev) => {
            return {
                defaultKnowledgeBase: [],
                KnowledgeBase: [],
                UploadedFiles: [],
            };
        });
        localStorage.removeItem('knowledgebase');
        localStorage.removeItem('defaultVectorDB');
        localStorage.removeItem('SMSS-SELECTED-MODEL');
        setTimeout(() => {
            if (
                (window.history?.length && window.history.length > 1) ||
                window.history.state?.idx
            ) {
                navigate(-1);
            } else {
                window.location.href =
                    'https://workshop.cfg.deloitte.com/cfg-ai-demo/SemossWeb/packages/client/dist/#/';
            }
        }, 1000);
    }
    const onRemove = async (uploadedFiles: any) => {
        const { pixelReturn: resp } = await runPixel(
            PIXELS.deleteAllDocsFromVectorDB(
                knowledgebaseData.defaultKnowledgeBase[0].value,
                uploadedFiles,
            ),
        );
    };
    const removeRooms = async (rooms: any) => {
        const { pixelReturn: resp } = await runPixel(
            PIXELS.removeAllRoom(rooms),
        );
    };
    function handleExitClose() {
        setShowExitDialog(false);
    }
    return (
        <>
            <ExitDialog
                open={showExitDialog}
                handleClose={handleExitClose}
                clearSession={clearSession}
            />
            <StyledPaper>
                <StyledBackdrop open={!chat.isInitialized || chat.isLoading}>
                    <CircularProgress color="inherit" />
                </StyledBackdrop>
                <ChatNavigation>
                    <StyledContent>
                        <StyledHeaderContainer>
                            {chatName}
                            <Tooltip
                                title={'Close the app & erase progress/data'}
                                placement="top"
                            >
                                <Button
                                    variant="contained"
                                    className="Button_CloseApp"
                                    onClick={() => setShowExitDialog(true)}
                                >
                                    Close App
                                </Button>
                            </Tooltip>
                        </StyledHeaderContainer>
                        {chat.activeRoom && chat.activeRoom.isInitialized ? (
                            <>
                                <ChatHeader />
                                <StyledScroll>
                                    <StyledScrollInner>
                                        {chat.activeRoom.log.map((m, mIdx) => {
                                            return (
                                                <ChatRenderer
                                                    key={mIdx}
                                                    message={m}
                                                    index={mIdx}
                                                    activeRoom={chat.activeRoom}
                                                />
                                            );
                                        })}
                                    </StyledScrollInner>
                                </StyledScroll>
                            </>
                        ) : (
                            <ChatSplash />
                        )}
                    </StyledContent>
                    <Stack display={'flex'} justifyContent={'center'}>
                        <StyledFooter sx={{ width: '100%' }}>
                            <ChatFooter />
                        </StyledFooter>
                    </Stack>
                </ChatNavigation>
            </StyledPaper>
        </>
    );
});
