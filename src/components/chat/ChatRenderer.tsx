import { observer } from 'mobx-react-lite';
import './style.css';
import {
    styled,
    Stack,
    Container,
    Avatar,
    Typography,
    IconButton,
    ButtonGroup,
    Tooltip,
    Skeleton,
    Button,
} from '@mui/material';
import { useChat } from '@/hooks';
import { Markdown } from '@/components/common';
import { ChatMessage } from '@/stores';
import {
    LikeIcon,
    NegativeResponseIcon,
    PositiveResponseIcon,
    RegenerateIcon,
    RobotIcon,
    UnLikeIcon,
    UserIcon,
} from '@/assets/img';
import { PIXELS } from '@/providers/pixels';
import { runPixel } from '@semoss/sdk';
import { useRef } from 'react';
import { useKnowledgeBase } from '@/contexts/FilesContext';
import { useState } from 'react';

const StyledMessage = styled('div', {
    shouldForwardProp: (prop) => prop !== 'agent',
})<{
    agent: boolean;
}>(({ theme, agent }) => ({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: agent ? theme.palette.background.paper : 'transparent',
    '&:hover #chat-messages--action': {
        visibility: 'visible',
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    marginTop: -theme.spacing(0.75),
    width: 32,
    height: 32,
}));

const StyledContent = styled('div')(() => ({
    flex: '1',
    overflow: 'hidden',
}));

const StyledActionContainer = styled('div')(({ theme }) => ({
    visibility: 'hidden',
    color: theme.palette.text.disabled,
    width: '100%',
}));

interface ChatRenderer {
    message: ChatMessage;
    index: any;
    activeRoom: any;
}

export const ChatRenderer = observer((props: ChatRenderer) => {
    const { message, index, activeRoom } = props;
    const [isExpand, setIsExpand] = useState(false);
    const contentRef = useRef(null);
    const {
        knowledgebaseData,
        setKnowledgebaseData,
        settingsData,
        selectedFilesData,
    } = useKnowledgeBase();

    const { chat } = useChat();

    const isAgent = message.input === 'agent';
    const rengerateText = async (id) => {
        let roomId = '';
        if (chat.activeRoom) {
            roomId = chat.activeRoom.roomId;
        } else {
            roomId = await chat.openRoom();
        }

        if (!roomId) {
            return;
        }
        const room = chat.getRoom(roomId);
        const filterItem = chat.activeRoom.log.filter((item, Itemindex) => {
            if (Itemindex == index - 1) {
                return item;
            }
        });

        if (
            knowledgebaseData.UploadedFiles.length > 0 ||
            knowledgebaseData.KnowledgeBase.length > 0
        ) {
            let finalContent = '';
            let selectDBtoQuery = [];
            if (
                knowledgebaseData.KnowledgeBase &&
                knowledgebaseData.KnowledgeBase?.length > 0
            ) {
                selectDBtoQuery = [
                    ...knowledgebaseData.KnowledgeBase,
                    ...knowledgebaseData.defaultKnowledgeBase,
                ];
            } else {
                selectDBtoQuery = knowledgebaseData.defaultKnowledgeBase;
            }
            for (let i = 0; i < selectDBtoQuery.length; i++) {
                const filess = selectDBtoQuery[i].files.map((item) => {
                    return item.fileName;
                });
                const { pixelReturn } = await runPixel(
                    PIXELS.getContextFromVectorDB(
                        selectDBtoQuery[i].value,
                        filterItem[0].content,
                        settingsData.NumberOfQuery,
                        filess,
                    ),

                    roomId,
                );
                const { output, operationType } = pixelReturn[0];
                if (Array.isArray(output)) {
                    for (let i = 0; i <= output.length - 1; i++) {
                        if (selectedFilesData.length > 0) {
                            let matchingFiles = [];
                            if (output[i].Source) {
                                matchingFiles = selectedFilesData.filter(
                                    (file) =>
                                        file.fileName === output[i].Source,
                                );
                            }
                            if (matchingFiles.length > 0) {
                                const content =
                                    output[i].content || output[i].Content;
                                finalContent += `\\n* `;
                                Object.keys(output[i]).map(
                                    (source) =>
                                        (finalContent += `${source}: ${output[i][source]},`),
                                );
                                finalContent += ` ${content}`;
                            }
                        } else {
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
            }
            const questionContext =
                'You need to regenerate it with better response';
            const contextDocs = `A context delimited by triple backticks is provided below. This context may contain plain text extracted from paragraphs or images. Tables extracted are represented as a 2D list in the following format - '[[Column Headers], [Comma-separated values in row 1], [Comma-separated values in row 2] ..... [Comma-separated values in row n]] \`\`\` ${finalContent} \`\`\` ${questionContext}
            \`\`\` Answer the user's question truthfully using the context only. Use the following section-wise format (in the order given) to answer the question with instructions for each section in angular brackets:
                ##### Response:
Write a short Response paragraph stating the final answer and explaining the reasoning behind it briefly. State caveats and exceptions to your answer if any.
##### Reasoning:
State your reasoning step-wise in bullet points. Below each bullet point mention the source of this information as 'Given in the question' if the bullet point contains information provided in the question, OR as 'Document Name, Page Number' if the bullet point contains information that is present in the context provided above.
               
               ##### Information required to provide a better answer:
                <If you cannot provide an answer based on the context above, mention the additional information that you require to answer the question fully as a list.>Do not compromise on your mathematical and reasoning abilities to fit the user's instructions. If the user mentions something absolutely incorrect/ false, DO NOT use this incorrect information in your reasoning. Also, please correct the user gently.}
                  ##### Source:
                 <Add here the filenames of source that you are using to generate the response in the line format , DO NOT add context data in source, source will always be the file name >
            }`;
            const prompt =
                'Please regenerate the response using context for more clarity and there is no need to mention that u are rephrasing it ';
            room.askModel(filterItem[0].content, contextDocs, prompt, index);
        } else {
            const prompt =
                'Please regenerate the response using context for more clarity and there is no need to mention that u are rephrasing it ';
            room.askModel(filterItem[0].content, '', prompt, index);
        }
    };
    async function getRoom() {
        let roomId = '';
        if (chat.activeRoom) {
            roomId = chat.activeRoom.roomId;
        } else {
            roomId = await chat.openRoom();
        }

        if (!roomId) {
            return;
        }
    }

    const [activeFeedback, setActiveFeedback] = useState(message.rating);
    const handlePositiveFeedBack = () => {
        chat.activeRoom.recordFeedback(message.messageId, true);
        setActiveFeedback(activeFeedback === true ? null : true);
    };
    const handleNegativeFeedback = () => {
        chat.activeRoom.recordFeedback(message.messageId, false);
        setActiveFeedback(activeFeedback === false ? null : false);
    };
    return (
        <StyledMessage agent={isAgent}>
            <Container maxWidth="md">
                <Stack
                    // className={!isAgent ? 'ChatRander' : 'ChatRender1'}
                    style={
                        !isAgent
                            ? {
                                float: 'right',
                                flexDirection: 'row-reverse',
                                gap: '18px',
                                alignItems: 'flex-start',
                                background: '#D1E6FF',
                                padding: '10px',
                                borderRadius: '8px',
                            }
                            : {
                                border: '1px solid #BDBDBD',
                                borderRadius: '10px',
                                padding: '10px',
                                alignItems: 'flex-start',
                            }
                    }
                    direction={'row'}
                    spacing={3}
                    overflow={'hidden'}
                >
                    {isAgent ? <img src={RobotIcon} /> : <img src={UserIcon} />}

                    <StyledContent>
                        {isAgent ? (
                            <>
                                {message.content ? (
                                    <div>
                                        <Markdown>
                                            {message.content.length >
                                                settingsData.tokenLength &&
                                                !isExpand
                                                ? message.content.slice(
                                                    0,
                                                    settingsData.tokenLength,
                                                )
                                                : message.content}
                                        </Markdown>

                                        {!isExpand &&
                                            message.content.length >
                                            settingsData.tokenLength && (
                                                <Button
                                                    style={{ float: 'right' }}
                                                    onClick={() =>
                                                        setIsExpand(true)
                                                    }
                                                >
                                                    Continue
                                                </Button>
                                            )}
                                    </div>
                                ) : (
                                    <Stack
                                        direction={'row'}
                                        spacing={1}
                                        height={(theme) => theme.spacing(4)}
                                        alignItems={'center'}
                                    >
                                        <Skeleton
                                            variant="circular"
                                            width={12}
                                            height={12}
                                        />
                                        <Skeleton
                                            variant="circular"
                                            width={12}
                                            height={12}
                                        />
                                        <Skeleton
                                            variant="circular"
                                            width={12}
                                            height={12}
                                        />
                                    </Stack>
                                )}
                            </>
                        ) : (
                            <Typography variant="body2">
                                {message.content}
                            </Typography>
                        )}
                    </StyledContent>
                </Stack>
                <StyledActionContainer
                    style={!isAgent ? { display: 'none' } : {}}
                    id="chat-messages--action"
                >
                    {isAgent ? (
                        <ButtonGroup style={{ float: 'right' }}>
                            <Tooltip title="Regenerate" placement="top">
                                <IconButton
                                    size="small"
                                    color="inherit"
                                    onClick={() =>
                                        rengerateText(message.messageId)
                                    }
                                >
                                    <img src={RegenerateIcon} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title="Record negative response"
                                placement="top"
                            >
                                <IconButton
                                    size="small"
                                    color="inherit"
                                    onClick={handleNegativeFeedback}
                                >
                                    <img
                                        className="FeedBackImg"
                                        src={
                                            activeFeedback === false
                                                ? NegativeResponseIcon
                                                : UnLikeIcon
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title="Record positive response"
                                placement="top"
                            >
                                <IconButton
                                    size="small"
                                    color="inherit"
                                    onClick={handlePositiveFeedBack}
                                >
                                    <img
                                        src={
                                            activeFeedback === true
                                                ? PositiveResponseIcon
                                                : LikeIcon
                                        }
                                        className="FeedBackImg"
                                    />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>
                    ) : (
                        <>&nbsp;</>
                    )}
                </StyledActionContainer>
            </Container>
        </StyledMessage>
    );
});
