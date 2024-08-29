import { useState, useEffect } from 'react';
import { useChat } from '@/hooks';
import { useInsight } from '@semoss/sdk-react';
import Select, { SingleValue, MultiValue } from 'react-select';
import './style.css';
import { PIXELS } from '@/providers/pixels';
import { runPixel } from '@semoss/sdk';
import { useKnowledgeBase } from '@/contexts/FilesContext';
import ShowSelectedReposFolder from './ShowSelectedReposFolder/ShowSelectedReposFolder';
import toast from 'react-hot-toast';
import { Tooltip } from '@mui/material';

interface OptionType {
    value: string;
    label: string;
}

export interface Model {
    database_name?: string;
    database_id?: string;
}
interface PixelReturnItem {
    output: any;
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

function Sidebar() {
    const { chat } = useChat();
    const { actions } = useInsight();
    const [isLoading, setIsLoading] = useState(false);
    const [userDetails, setUserDetails] = useState({ email: '', id: '' });

    // All Vector Database
    const [vectorOptions, setVectorOptions] = useState<OptionType[]>([]);
    const [selectedVectorDB, setSelectedVectorDB] = useState<any[]>([]);
    const [isSelectedRepos, setIsSelectedRepos] = useState(false);
    const {
        knowledgebaseData,
        setKnowledgebaseData,
        vectordbFiles,
        setVectordbFiles,
        setDbSelectedFilesData,
        dbSelectedFilesData,
    } = useKnowledgeBase();
    const [selectedModel, setSelectedModel] = useState(false);
    const [modelOptions, setModelOptions] = useState([]);
    const [selectedRepoShow, setSelectedRepoShow] = useState();

    useEffect(() => {
        setIsLoading(true);
        // Grabbing all the Vector Databases in CfG
        const pixel = `MyEngines ( engineTypes=["VECTOR"]);`;

        actions
            .run(pixel)
            .then((response) => {
                const { output, operationType } = response.pixelReturn[0];

                if (operationType.indexOf('ERROR') > -1) {
                    throw new Error(output as string);
                }
                if (Array.isArray(output)) {
                    const transformedOptions = output.map((option: any) => ({
                        value: option.database_id,
                        label: option.database_name,
                    }));
                    setVectorOptions(transformedOptions);
                    const existVectorDbItem = transformedOptions.filter(
                        (item, index) => {
                            if (item.label.includes('chatbotDefaultVDB')) {
                                return item;
                            }
                        },
                    );
                    if (
                        Array.isArray(existVectorDbItem) &&
                        existVectorDbItem.length > 0
                    ) {
                        // default db exist
                        localStorage.setItem(
                            'defaultVectorDB',
                            JSON.stringify(existVectorDbItem),
                        );
                        setKnowledgebaseData((prev) => {
                            return {
                                ...prev,
                                defaultKnowledgeBase: existVectorDbItem,
                            };
                        });
                    } else {
                        createVectorDB();
                    }

                    // setSelectedVectorDB([transformedOptions[0]]);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    }, [userDetails]);

    async function createVectorDB() {
        // const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let activeRoomId = '';
        if (chat.activeRoom) {
            activeRoomId = chat.activeRoom.roomId;
        } else {
            activeRoomId = await chat.openRoom();
        }

        if (!activeRoomId) {
            return;
        }
        if (userDetails.email.length > 0) {
            const database = [`chatbotDefaultVDB${userDetails.id}`];
            const conDetails = [
                {
                    NAME: database[0],
                    VECTOR_TYPE: 'FAISS',
                    EMBEDDER_ENGINE_ID: 'e4449559-bcff-4941-ae72-0e3f18e06660',
                    INDEX_CLASSES: 'default',
                    CONTENT_LENGTH: '512',
                    CONTENT_OVERLAP: '0',
                    DISTANCE_METHOD: 'Squared Euclidean (L2) distance',
                },
            ];
            const { pixelReturn } = await runPixel(
                PIXELS.CreateVectorDatabaseEngine(database, conDetails),
                activeRoomId,
            );

            if (pixelReturn.length > 0 && isPixelReturnItem(pixelReturn[0])) {
                const { output, operationType } = pixelReturn[0];
                const vectodbobject = [
                    {
                        value: output.database_name,
                        label: output.database_id,
                    },
                ];
                // setSelectedVectorDB(vectodbobject);
                setKnowledgebaseData((prev) => {
                    return {
                        ...prev,
                        defaultKnowledgeBase: vectodbobject,
                    };
                });
                localStorage.setItem(
                    'defaultVectorDB',
                    JSON.stringify(vectodbobject),
                );
            } else {
                console.error(
                    'pixelReturn does not have the expected structure',
                );
            }
        }
    }

    useEffect(() => {
        let mmodelOptions = [];
        chat.models.options.forEach((item) => {
            if (
                item.app_subtype !== 'EMBEDDED' &&
                item.app_subtype !== 'TEXT_EMBEDDINGS'
            ) {
                mmodelOptions.push({
                    value: item.app_id,
                    label: item.app_name,
                });
            }
        });
        setModelOptions(mmodelOptions);
    }, [chat.models.options]);
    const handleModelChange = (selectedOption: SingleValue<OptionType>) => {
        if (selectedOption) {
            chat.setSelectedModel(selectedOption.value);
            setSelectedModel(!selectedModel);
        }
    };

    const handleRepositoryChange = (
        selectedOptions: MultiValue<OptionType>,
    ) => {
        const selectedValues = selectedOptions.map((option) => option);

        if (selectedOptions && selectedOptions?.length > 0) {
            fetchDocsInRoom(
                selectedOptions[selectedOptions.length - 1]?.value,
                selectedOptions[selectedOptions.length - 1],
            );
        }
        const vectordbFilesItems = vectordbFiles.filter((item) => {
            if (selectedOptions.some((itemm) => itemm.label === item.name)) {
                return item;
            }
        });
        const filterdbSelectedFilesData = dbSelectedFilesData.filter((item) => {
            if (selectedOptions.some((itemm) => itemm.label === item.name)) {
                return item;
            }
        });
        setDbSelectedFilesData(filterdbSelectedFilesData);
        setVectordbFiles(vectordbFilesItems);
        setSelectedVectorDB(selectedValues);
        setKnowledgebaseData((prev) => {
            return {
                ...prev,
                KnowledgeBase: selectedValues,
            };
        });
        localStorage.setItem('knowledgebase', JSON.stringify(selectedOptions));
    };
    useEffect(() => {
        const knowledgee: any = JSON.parse(
            localStorage.getItem('knowledgebase'),
        );
        if (knowledgee && knowledgee.length > 0) {
            knowledgee.forEach((element) => {
                fetchDocsInRoom(element.value, element);
            });
        }
        setSelectedVectorDB(JSON.parse(localStorage.getItem('knowledgebase')));
        setKnowledgebaseData((prev) => {
            return {
                ...prev,
                KnowledgeBase: knowledgee,
            };
        });
    }, []);
    async function getUserData() {
        const { pixelReturn } = await runPixel(PIXELS.GetUserInfo());
        const { output, operationType } = pixelReturn[0];

        if (pixelReturn.length > 0 && isPixelReturnItem(pixelReturn[0])) {
            const { output, operationType } = pixelReturn[0];

            setUserDetails(output.MS);
            localStorage.setItem('userInfo', JSON.stringify(output.MS));
        } else {
            console.error('pixelReturn does not have the expected structure');
        }
    }
    useEffect(() => {
        getUserData();
    }, []);
    function handleClose() {
        setIsSelectedRepos(false);
    }

    const fetchDocsInRoom = async (id, vectorDB) => {
        const activeRoom = chat.getRoom(chat.activeRoomId);
        setIsLoading(true);
        const { pixelReturn: resp } = await runPixel(
            PIXELS.getAllDocuments(id),
        );
        const { output, operationType } = resp[0];
        if (operationType.indexOf('ERROR') > -1) {
            toast.error(output as string);
        }
        if (Array.isArray(output)) {
            const resultDocsFromVectorDB = output.map((item) => {
                return { ...item, checked: true };
            });
            const object = {
                name: vectorDB.label,
                value: vectorDB.value,
                files: resultDocsFromVectorDB,
            };
            setVectordbFiles((prev) => {
                return [...prev, object];
            });
        }
    };
    console.log('VectordbFiles', vectordbFiles, dbSelectedFilesData);
    return (
        <>
            <ShowSelectedReposFolder
                handleClose={handleClose}
                setIsSelectedRepos={setIsSelectedRepos}
                isSelectedRepos={isSelectedRepos}
                options={knowledgebaseData.KnowledgeBase}
                vectordbFiles={vectordbFiles}
                setSelectedRepoShow={setSelectedRepoShow}
                selectedRepoShow={selectedRepoShow}
            />
            <div style={{ borderRight: '1px solid #C0C0C0' }}>
                <div className="select-tab-container">
                    <label className="select-label">Select Model</label>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        onChange={handleModelChange}
                        value={modelOptions.find(
                            (option) =>
                                option?.value === chat?.models?.selected,
                        )}
                        name="model"
                        options={modelOptions}
                    />
                    <label className="select-label">
                        Select Knowledge Repository
                    </label>
                    <Select
                        defaultValue={[]}
                        isMulti
                        name="knowledge_repository"
                        value={knowledgebaseData.KnowledgeBase}
                        options={vectorOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleRepositoryChange}
                        components={{
                            MultiValueLabel: (props) => {
                                return (
                                    <Tooltip
                                        title={props.data.label}
                                        placement="top"
                                    >
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                padding: '2px',
                                            }}
                                            onClick={() => {
                                                setIsSelectedRepos(true);
                                                setSelectedRepoShow(props.data);
                                            }}
                                        >
                                            {`${props.data.label.slice(
                                                0,
                                                10,
                                            )}...`}
                                        </div>
                                    </Tooltip>
                                );
                            },
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default Sidebar;
