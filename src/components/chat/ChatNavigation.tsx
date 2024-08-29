import { observer } from 'mobx-react-lite';
import Sidebar from '../common/Select_Sidebar/SelectSidebar';
import AddIcon from '@mui/icons-material/Add';
import './style.css';
import {
    styled,
    Paper,
    Button,
    Stack,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ThemeProvider,
    createTheme,
    IconButton,
    Tooltip,
    CircularProgress,
    Backdrop,
    useMediaQuery,
} from '@mui/material';
import {
    ChatBubbleOutlineOutlined,
    Close,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { darkTheme } from '@/theme';
import { useChat } from '@/hooks';
import { useState } from 'react';

const MOBILE_HEIGHT = '56px';

const StyledMobileNav = styled(Paper)(() => ({
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    zIndex: theme.zIndex.drawer + 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: MOBILE_HEIGHT,
    width: '100%%',
    borderRadius: '0',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
}));

const StyledSidebar = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'open',
})<{
    open: boolean;
}>(({ open }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '197px',
    borderRadius: '0',
    padding: theme.spacing(1),
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        position: 'absolute',
        zIndex: open ? theme.zIndex.drawer + 2 : -1,
        width: '100%',
        maxWidth: '280px',
    },
}));

const StyledSidebarHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
}));

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
    position: 'absolute',
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.contrastText,
}));

const StyledContent = styled('div')(({ theme }) => ({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    width: '100%',
    backgroundColor: theme.palette.grey[50],
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        paddingTop: MOBILE_HEIGHT,
    },
}));

const StyledBottom = styled('div')(() => ({
    flex: '1',
    width: '100%',
    overflow: 'auto',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
    gap: theme.spacing(1.5),
    color: selected ? theme.palette.primary.light : '',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
    color: 'inherit',
    minWidth: 'auto',
}));

const StyledCloseButton = styled(IconButton)(() => ({
    color: 'inherit',
}));

const theme = createTheme(darkTheme);

interface ChatNavigationProps {
    children: React.ReactNode;
}

export const ChatNavigation = observer((props: ChatNavigationProps) => {
    const { children } = props;

    const { chat } = useChat();
    const [isOpen, setIsOpen] = useState(false);

    const matches = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Stack
            flex={1}
            direction={'row'}
            sx={{ position: 'relative' }}
            overflow={'hidden'}
        >
            <ThemeProvider theme={theme}>
                {matches && (
                    <StyledMobileNav>
                        <IconButton onClick={() => setIsOpen(!isOpen)}>
                            <MenuIcon />
                        </IconButton>
                    </StyledMobileNav>
                )}
                <StyledSidebar
                    open={isOpen}
                    variant={'elevation'}
                    elevation={1}
                >
                    <StyledSidebarHeader>
                        <Button
                            className="NewChat_Button"
                            variant={'contained'}
                            color={'primary'}
                            size={'small'}
                            onClick={() => chat.openRoom()}
                        >
                            <AddIcon />
                            New Chat
                        </Button>
                    </StyledSidebarHeader>
                    <StyledBottom>
                        <List
                            component="nav"
                            dense={true}
                            aria-label="open chat rooms"
                        >
                            <Stack direction={'column'} spacing={1.5}>
                                {chat.order.map((roomId) => {
                                    // get the room
                                    const room = chat.getRoom(roomId);

                                    let name = '';

                                    if (room.metadata && room.metadata.name) {
                                        name = room.metadata.name;
                                    }

                                    if (!name) {
                                        for (const m of room.log) {
                                            if (m.input === 'user') {
                                                name = m.content;
                                                break;
                                            }
                                        }
                                    }

                                    if (!name) {
                                        name = 'New Chat';
                                    }

                                    return (
                                        <StyledListItemButton
                                            key={roomId}
                                            selected={
                                                chat.activeRoomId === roomId
                                            }
                                            onClick={() =>
                                                chat.selectRoom(roomId)
                                            }
                                        >
                                            <StyledListItemIcon>
                                                <ChatBubbleOutlineOutlined fontSize="inherit" />
                                            </StyledListItemIcon>
                                            <ListItemText
                                                primary={name}
                                                primaryTypographyProps={{
                                                    variant: 'subtitle2',
                                                    noWrap: true,
                                                    fontSize: '12px',
                                                }}
                                            />
                                            {room.isLoading && (
                                                <>
                                                    <ListItemIcon
                                                        sx={{
                                                            color: 'inherit',
                                                            minWidth: 'auto',
                                                        }}
                                                    >
                                                        <CircularProgress
                                                            color={'inherit'}
                                                            size={'20px'}
                                                        ></CircularProgress>
                                                    </ListItemIcon>
                                                </>
                                            )}
                                            <Tooltip
                                                title="Close the room"
                                                placement="right"
                                            >
                                                <StyledCloseButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    size={'small'}
                                                    onClick={(e) => {
                                                        // don't propagate
                                                        e.stopPropagation();

                                                        // close it
                                                        chat.closeRoom(roomId);
                                                    }}
                                                >
                                                    <Close fontSize="inherit" />
                                                </StyledCloseButton>
                                            </Tooltip>
                                        </StyledListItemButton>
                                    );
                                })}
                            </Stack>
                        </List>
                    </StyledBottom>
                </StyledSidebar>
            </ThemeProvider>
            <Sidebar />
            <StyledBackdrop open={isOpen} onClick={() => setIsOpen(false)} />
            <StyledContent>{children}</StyledContent>
        </Stack>
    );
});
