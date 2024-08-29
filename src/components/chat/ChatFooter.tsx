import React from 'react';
import { useState, useEffect } from 'react';
import './style.css';
import { observer } from 'mobx-react-lite';
import {
    styled,
    Container,
    Paper,
    IconButton,
    InputBase,
    Tooltip,
    Typography,
    LinearProgress,
    Popover,
    Slider,
    Divider,
    Button,
    DialogActions,
    Box,
    Dialog,
    DialogTitle,
} from '@mui/material';
import { Send, Clear, Mic, Settings } from '@mui/icons-material';
import { useChat } from '@/hooks';
import {
    TEMPERATURE,
    TOKEN_LENGTH,
    ChatRoom,
    NumberOfQuery,
    MODEL_INPUT_LENGTH,
} from '@/stores';
import { PIXELS } from '@/providers/pixels';
import { runPixel } from '@semoss/sdk';

import { Prompt_LOGO, upload_file, global_Icon } from '../../assets/img/index';
import toast from 'react-hot-toast';
import UploadDocument from '../common/UploadDocumentModal/DocumentModal';
import { useKnowledgeBase } from '@/contexts/FilesContext';
import ShowPrompts from '../common/ShowPrompts/ShowPrompts';

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: theme.spacing(3.5),
    overflow: 'hidden',
    width: '100%',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingRight: theme.spacing(3),
    overflow: 'hidden',
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
    flex: 1,
    fontSize: theme.typography.fontSize,
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
}));

const StyledLoading = styled(LinearProgress)(() => ({
    position: 'absolute',
    bottom: '0',
    width: '100%',
}));

const StyledMessage = styled(Typography)(({ theme }) => ({
    position: 'absolute',
    color: theme.palette.text.disabled,
    fontSize: '10px',
    padding: theme.spacing(0.5),
}));

// For Speech Recognition API
let speech;
if ('webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.webkitSpeechRecognition;
    speech = new SpeechRecognition();
    speech.continuous = true;
} else {
    speech = null;
}

export const ChatFooter = observer(() => {
    const { chat } = useChat();

    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [additionalContext, setAdditionalContext] = useState<string>('');

    const [questionContext, setQuestionContext] = useState<string>(
        "Use the following pieces of information to answer the user's question. " +
        `${additionalContext} ` +
        "If you do not know the answer, just say that you don't know, don't try to make up an answer.",
    );
    const {
        knowledgebaseData,
        setSettingsData,
        selectedFilesData,
        setSelectedFilesData,
        dbSelectedFilesData,
        setDbSelectedFilesData,
        vectordbFiles,
    } = useKnowledgeBase();
    const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
    let oldMessage: any = [];

    const [settingsAnchorEle, setSettingsAnchorEle] =
        useState<HTMLButtonElement | null>(null);
    const [settings, setSettings] = useState<
        Pick<
            ChatRoom['options'],
            'prompt' | 'temperature' | 'tokenLength' | 'NumberOfQuery'
        >
    >({
        prompt: '',
        temperature: TEMPERATURE,
        tokenLength: TOKEN_LENGTH,
        NumberOfQuery: NumberOfQuery,
    });

    // it's loading if something is running
    const isLoading = chat.activeRoom && chat.activeRoom.isLoading;

    // it will be disabled if there no model, no input or it is loadingg
    const isDisabled =
        isLoading ||
        (chat.activeRoom &&
            !chat.activeRoom.isInitialized &&
            !chat.models.selected) ||
        !input;

    let buttonTooltip = '';
    if (isLoading) {
        buttonTooltip = 'Please wait';
    } else if (
        chat.activeRoom &&
        !chat.activeRoom.isInitialized &&
        !chat.models.selected
    ) {
        buttonTooltip = 'Please select a model';
    } else if (!input) {
        buttonTooltip = 'Please enter input';
    } else if (!isDisabled) {
        buttonTooltip = 'Ask model';
    }

    // update the settings when the active room changes
    useEffect(() => {
        if (!chat.activeRoom) {
            setSettings({
                prompt: '',
                temperature: TEMPERATURE,
                tokenLength: TOKEN_LENGTH,
                NumberOfQuery: NumberOfQuery,
            });
            setSettingsData({
                temperature: TEMPERATURE,
                tokenLength: TOKEN_LENGTH,
                NumberOfQuery: NumberOfQuery,
            });
            return;
        }

        // set the settings
        const options = chat.activeRoom.options;
        setSettings({
            prompt: options.prompt,
            tokenLength: options.tokenLength,
            temperature: options.temperature,
            NumberOfQuery: options.NumberOfQuery,
        });
        setSettingsData({
            tokenLength: options.tokenLength,
            temperature: options.temperature,
            NumberOfQuery: options.NumberOfQuery,
        });
    }, []);

    /**
     * Trigger a change
     *
     * @param input - input to ask the model
     */
    const askModel = async (input: string) => {
        // check if there is something to ask
        if (
            isLoading ||
            (chat.activeRoom &&
                !chat.activeRoom.isInitialized &&
                !chat.models.selected) ||
            !input
        ) {
            return;
        }

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
        let finalContent = ``;
        // get the room
        const room = chat.getRoom(roomId);

        // initialize the room with an empty context if it isn't
        if (!room.isInitialized) {
            // initialize the room
            const model: any = JSON.parse(
                localStorage.getItem('SMSS-SELECTED-MODEL'),
            );

            await room.initialize(model);
        }

        // set the settings
        room.setOptions(settings);
        if (
            knowledgebaseData?.UploadedFiles?.length > 0 ||
            knowledgebaseData?.KnowledgeBase?.length > 0
        ) {
            let selectDBtoQuery = [];
            if (
                knowledgebaseData.KnowledgeBase &&
                knowledgebaseData.KnowledgeBase?.length > 0
            ) {
                if (dbSelectedFilesData.length == 0) {
                    selectDBtoQuery = [...vectordbFiles];
                } else {
                    selectDBtoQuery = [...dbSelectedFilesData];
                }
                for (let i = 0; i < selectDBtoQuery.length; i++) {
                    const filess = selectDBtoQuery[i].files.map((item) => {
                        return item.fileName;
                    });

                    const { pixelReturn } = await runPixel(
                        PIXELS.getContextFromVectorDB(
                            selectDBtoQuery[i].value,
                            input,
                            settings.NumberOfQuery,
                            filess,
                            //  {
                            // indexClass: searchInKnowledgeBase
                            // ? APPID + "-index"
                            // : activeRoomId + "-index",
                            // }
                        ),

                        roomId,
                    );

                    const { output, operationType } = pixelReturn[0];
                    if (Array.isArray(output)) {
                        for (let i = 0; i <= output.length - 1; i++) {
                            const content =
                                output[i].content || output[i].Content;
                            finalContent += `\\n* `;
                            Object.keys(output[i]).map(
                                (source) =>
                                    (finalContent += `${source}: ${output[i][source]},`),
                            );
                            finalContent += ` ${content}`;
                        }
                    }
                }
            } else {
                selectDBtoQuery = knowledgebaseData.defaultKnowledgeBase;
                const { pixelReturn } = await runPixel(
                    PIXELS.getContextFromVectorDB(
                        selectDBtoQuery[0].value,
                        input,
                        settings.NumberOfQuery,
                        [],
                        //  {
                        // indexClass: searchInKnowledgeBase
                        // ? APPID + "-index"
                        // : activeRoomId + "-index",
                        // }
                    ),

                    roomId,
                );

                const { output, operationType } = pixelReturn[0];
                if (Array.isArray(output)) {
                    for (let i = 0; i <= output.length - 1; i++) {
                        const content = output[i].content || output[i].Content;
                        finalContent += `\\n* `;
                        Object.keys(output[i]).map(
                            (source) =>
                                (finalContent += `${source}: ${output[i][source]},`),
                        );
                        finalContent += ` ${content}`;
                    }
                }
            }

            const contextDocs = `A context delimited by triple backticks is provided below. This context may contain plain text extracted from paragraphs or images. Tables extracted are represented as a 2D list in the following format - '[[Column Headers], [Comma-separated values in row 1], [Comma-separated values in row 2] ..... [Comma-separated values in row n]] \`\`\` ${finalContent} \`\`\` ${questionContext}
            \`\`\` Answer the user's question truthfully using the context only. Use the following section-wise format (in the order given) to answer the question with instructions for each section in angular brackets:
                ##### Response:
Write a short Response paragraph stating the final answer and explaining the reasoning behind it briefly. State caveats and exceptions to your answer if any.
##### Reasoning:
State your reasoning step-wise in bullet points. Below each bullet point add from which source of this information is extracted as 'Given in the question' if the bullet point contains information provided in the question, OR as 'Document Name, Page Number' if the bullet point contains information that is present in the context provided above.
               
               ##### Information required to provide a better answer:
                <If you cannot provide an answer based on the context above, mention the additional information that you require to answer the question fully as a list.>Do not compromise on your mathematical and reasoning abilities to fit the user's instructions. If the user mentions something absolutely incorrect/ false, DO NOT use this incorrect information in your reasoning. Also, please correct the user gently.}
               ##### Source:
                 <Add here the file names of source that you are using to generate the response in the line format , DO NOT add context data in source, source will always be the file name and each file name should be in new line >
            }`;
            const prompt =
                'Answer questions from the given context and check chat history also if it has some context and reply "I dont know" if the answer is not found in the context';
            room.askModel(input, contextDocs, prompt, '');
        } else {
            room.askModel(input, '', '', '');
        }
        setInput('');
    };

    /**
     * Open the popover
     * @param event - mouse event
     */
    const openSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSettingsAnchorEle(event.currentTarget);
    };

    /**
     * Close the popover
     * @param event - mouse event
     */
    const closeSettings = () => {
        setSettingsAnchorEle(null);
    };

    /**
     * Update the settings
     *
     * updated - updated settings
     */
    const updateSettings = (updated: Partial<typeof settings>) => {
        // merge the old with the new
        const merged = {
            ...settings,
            ...updated,
        };

        // set the options
        setSettings(merged);

        // update the active room if possible
        if (chat.activeRoom) {
            chat.activeRoom.setOptions(merged);
        }
    };

    /**
     * Voice Recognition
     */
    useEffect(() => {
        speech.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsRecording(false);
        };
        speech.onerror = (event) => {
            console.error('Speech recognition error occurred: ' + event.error);
            setIsRecording(false); // Turn Listening Off
        };

        return () => {
            console.warn('Cleaning up speech recognition');
            speech.stop();
            setIsRecording(false);
        };
    }, []);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const [temperature, setTemprature] = useState(TEMPERATURE);
    const [Token, setToken] = useState(TOKEN_LENGTH);
    const [Numberquery, setNumberQuery] = useState(NumberOfQuery);
    const handleClose = () => {
        setTemprature(settings.temperature);
        setToken(settings.tokenLength);
        setNumberQuery(settings.NumberOfQuery);
        setOpen(false);
    };
    const SaveUpdateSettings = () => {
        if (
            temperature != settings.temperature ||
            Token != settings.tokenLength ||
            Numberquery != settings.NumberOfQuery
        ) {
            setSettings((prevSettings) => ({
                ...prevSettings,
                temperature: temperature,
                tokenLength: Number(Token) || 0,
                NumberOfQuery: Number(Numberquery) || 0,
            }));
            setSettingsData({
                temperature: temperature,
                tokenLength: Number(Token) || 0,
                NumberOfQuery: Number(Numberquery) || 0,
            });
            toast.success('Settings updated successfully!');
        }
        setOpen(false);
    };
    const [isShowPromptsOpen, setIsShowPromptsOpen] = useState(false);
    const ShowPromptsDialogOpen = () => {
        setIsShowPromptsOpen(true);
    };
    const ShowPromptsClose = () => {
        setIsShowPromptsOpen(false);
    };

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose1 = () => {
        setAnchorEl(null);
    };

    const fileUploadDialogOpen = () => {
        setIsFileUploadOpen(true);
        handleClose1();
    };

    const fileUploadDialogClose = () => {
        setIsFileUploadOpen(false);
    };

    const open1 = Boolean(anchorEl);
    const id = open1 ? 'simple-popover' : undefined;

    return (
        <>
            <UploadDocument
                isFileUploadOpen={isFileUploadOpen}
                onClose={fileUploadDialogClose}
                setIsFileUploadOpen={setIsFileUploadOpen}
            />
            <ShowPrompts
                isShowPromptsOpen={isShowPromptsOpen}
                onClose={isShowPromptsOpen}
                ShowPromptsClose={ShowPromptsClose}
                input={input}
                setInput={setInput}
            />
            <StyledFooter>
                <Container maxWidth="md">
                    <StyledPaper elevation={2}>
                        <StyledInput
                            placeholder="Ask"
                            inputProps={{
                                'aria-label': 'Input to send to the model',
                            }}
                            value={input}
                            disabled={isLoading}
                            multiline={true}
                            maxRows={6}
                            onChange={(e) => {
                                if (
                                    e.target.value.length < MODEL_INPUT_LENGTH
                                ) {
                                    if (e.target.value.trim()) {
                                        setInput(e.target.value);
                                    } else {
                                        setInput('');
                                    }
                                } else {
                                    toast.error(
                                        'Prompt is larger than the token limit, please shorten/break it into mutiple prompts or reduce the queried results setting',
                                    );
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    askModel(input);
                                }
                            }}
                        />
                        {input && (
                            <>
                                <Tooltip
                                    title="Reset the input"
                                    placement="top"
                                >
                                    <IconButton
                                        size={'small'}
                                        aria-label="Reset the input"
                                        onClick={() => setInput('')}
                                    >
                                        <Clear fontSize="inherit"></Clear>
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title="Upload Documents" placement="top">
                            <IconButton onClick={fileUploadDialogOpen}>
                                <img src={upload_file} alt={upload_file} />
                                <Popover
                                    anchorReference="anchorPosition"
                                    open={open1}
                                    id={id}
                                    anchorPosition={{ top: 405, left: 1090 }}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                ></Popover>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Show Prompts" placement="top">
                            <IconButton
                                disabled={isLoading}
                                onClick={ShowPromptsDialogOpen}
                            >
                                <img src={Prompt_LOGO} alt={Prompt_LOGO} />
                            </IconButton>
                        </Tooltip>
                        {!input ? (
                            <Tooltip title="Click to Listen" placement="top">
                                <span>
                                    <IconButton
                                        size={'small'}
                                        type="button"
                                        aria-label="Ask the Model"
                                        color={
                                            isRecording ? 'error' : 'default'
                                        }
                                        disabled={isLoading || !speech}
                                        onClick={() => {
                                            if (!isRecording) {
                                                setIsRecording(true);
                                                speech.start();
                                            }
                                        }}
                                    >
                                        <Mic fontSize="inherit" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <></>
                        )}

                        <Tooltip title="Open Chat Settings" placement="top">
                            <span className="Button_settings">
                                <IconButton
                                    aria-describedby={'chat-footer--settings'}
                                    size={'small'}
                                    type="button"
                                    aria-label="Open settings"
                                    disabled={isLoading}
                                    onClick={(e) => {
                                        openSettings(e);
                                        handleClickOpen();
                                    }}
                                >
                                    <Settings fontSize="inherit" />
                                </IconButton>
                                <Dialog
                                    open={open}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle>
                                        <Typography
                                            variant="subtitle2"
                                            className="Set_Settings"
                                        >
                                            Settings
                                        </Typography>
                                    </DialogTitle>
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="subtitle2" mb={1}>
                                            Token Length
                                        </Typography>
                                        <input
                                            type="number"
                                            className="Token_Length"
                                            value={Token}
                                            onChange={(e) => {
                                                setToken(
                                                    Number(e.target.value),
                                                );
                                            }}
                                        />
                                        <Typography variant="subtitle2" my={1}>
                                            <div className="Temperature">
                                                <span>Temperature </span>
                                                <img
                                                    src={global_Icon}
                                                    alt={global_Icon}
                                                />
                                            </div>
                                        </Typography>
                                        <Slider
                                            aria-label="Temperature"
                                            value={temperature}
                                            onChange={(e, val) => {
                                                setTemprature(val as number);
                                            }}
                                            size="small"
                                            valueLabelDisplay="auto"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                        />
                                        <Typography variant="subtitle2" my={1}>
                                            <div className="NumberOfQuery">
                                                <span>
                                                    Number of queried result
                                                </span>
                                                <img
                                                    src={global_Icon}
                                                    alt={global_Icon}
                                                />
                                            </div>
                                        </Typography>
                                        <Slider
                                            aria-label="Number of query result"
                                            value={Numberquery}
                                            size="small"
                                            valueLabelDisplay="auto"
                                            onChange={(e, val) => {
                                                setNumberQuery(val as number);
                                            }}
                                            min={1}
                                            max={10}
                                            step={1}
                                        />
                                    </Box>
                                    <Divider className="Divider" />
                                    <DialogActions className="Setting_DialogActions">
                                        <Button
                                            variant="outlined"
                                            className="Settings_button"
                                            onClick={() => handleClose()}
                                            autoFocus
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="contained"
                                            autoFocus
                                            className="Settings_button"
                                            onClick={() => SaveUpdateSettings()}
                                        >
                                            Save
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </span>
                        </Tooltip>
                        <Divider
                            orientation="vertical"
                            variant="middle"
                            flexItem
                        />
                        <Tooltip title={buttonTooltip} placement="top">
                            <span>
                                <IconButton
                                    size={'small'}
                                    type="button"
                                    aria-label="Ask the Model"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        askModel(input);
                                    }}
                                >
                                    <Send fontSize="inherit" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {isLoading && <StyledLoading />}
                    </StyledPaper>
                    <StyledMessage variant={'caption'}>
                        Press Enter To Ask
                    </StyledMessage>
                </Container>
            </StyledFooter>
        </>
    );
});
