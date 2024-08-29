import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import UploadContainer from '../fileUpload/index';
import {
    Divider,
    LinearProgress,
    Button,
    DialogActions,
    DialogContent,
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { newRoomState } from '@/providers/atoms/chat';
import { PIXELS } from '@/providers/pixels';
import toast from 'react-hot-toast';
import { useInsight } from '@semoss/sdk-react';
import './style.css';
import { runPixel, upload } from '@semoss/sdk';
import { ResultDocsFromVectorDB } from '@/lib/types';
import { useChat } from '@/hooks';
import { useKnowledgeBase } from '@/contexts/FilesContext';
export interface Model {
    database_name?: string;
    database_id?: string;
}

function UploadDocument(props) {
    const { onClose, isFileUploadOpen = false, setIsFileUploadOpen } = props;
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const { knowledgebaseData, setKnowledgebaseData } = useKnowledgeBase();
    const [file, setFile] = useState([]);
    const { chat } = useChat();
    const handleClose = () => {
        onClose();
        setFile([]);
    };
    const finalUpload = (file) => {
        const target = file.length > 0 ? `${file.length} files` : `file`;

        if (file && file?.length > 0) {
            toast.promise(handleUpload(file), {
                loading: `Uploading ${target}...`,
                success: () => {
                    setFile([]);
                    handleClose();
                    return `${target} uploaded`;
                },
                error: `Failed to upload ${target}`,
            });
        }
    };
    const handleUpload = async (selectedFiles: File[]) => {
        setIsUploading(true);
        let activeRoomId = '';
        if (chat.activeRoom) {
            activeRoomId = chat.activeRoom.roomId;
        } else {
            activeRoomId = await chat.openRoom();
        }

        if (!activeRoomId) {
            return;
        }

        const resp = await upload(selectedFiles, activeRoomId, null, '');

        const fileLocationPathAfterUpload = [];
        // eslint-disable-next-line prefer-const
        for (let eachFile of resp) {
            const { fileLocation } = eachFile;
            fileLocationPathAfterUpload.push(fileLocation);
        }
        toast.loading('Creating Vector Embedding...it can take some time.', {
            icon: '🚀',
            duration: 4000,
        });
        // It should trigger Vector DB to `insert` the file but it should be to this
        const { pixelReturn } = await runPixel(
            PIXELS.addToVectorDB(
                knowledgebaseData.defaultKnowledgeBase[0].value,
                fileLocationPathAfterUpload,
            ),
            activeRoomId,
        );

        const { output, operationType } = pixelReturn[0];
        setIsUploading(false);
        if (operationType.indexOf('ERROR') > -1) {
            toast.error(
                `Create Vector Embedding failed. Due to ${output as string}`,
            );
            return;
        } else {
            toast.success('File Uploaded Successfully', { icon: '🚀' });
            fetchDocsInRoom();
        }
    };
    const onRemove = async (files: any) => {
        const { pixelReturn: resp } = await runPixel(
            PIXELS.deleteDocsFromVectorDB(
                knowledgebaseData.defaultKnowledgeBase[0].value,
                files.fileName,
            ),
        );
        const { output, operationType } = resp[0];
        if (operationType.indexOf('ERROR') > -1) {
            toast.error(output as string);
        }
        if (output) {
            toast.success('Document removed successfully');
        }
        fetchDocsInRoom();
    };
    const fetchDocsInRoom = async () => {
        // fetch the updated list of files from vector DB with this room id, update the list
        const { pixelReturn: resp } = await runPixel(
            PIXELS.getAllDocuments(
                knowledgebaseData.defaultKnowledgeBase[0].value,
            ),
        );
        setIsUploading(false);
        const { output, operationType } = resp[0];
        if (operationType.indexOf('ERROR') > -1) {
            toast.error(output as string);
        }
        if (Array.isArray(output)) {
            const resultDocsFromVectorDB = output as ResultDocsFromVectorDB[];
            setUploadedFiles(resultDocsFromVectorDB);
            setKnowledgebaseData((prev) => {
                return { ...prev, UploadedFiles: resultDocsFromVectorDB };
            });
        }
    };
    useEffect(() => {
        if (
            knowledgebaseData.defaultKnowledgeBase.length > 0 &&
            uploadedFiles.length == 0
        ) {
            fetchDocsInRoom();
        }
    }, [knowledgebaseData.defaultKnowledgeBase]);

    return (
        <>
            <Dialog
                className="upload-container"
                onClose={handleClose}
                open={isFileUploadOpen}
            >
                <DialogTitle className="title-header">
                    Upload Documents
                </DialogTitle>
                <DialogContent className="knowledge-upload-container">
                    <UploadContainer
                        onUpload={(files) => handleUpload(files)}
                        maxFiles={10}
                        uploadedFiles={uploadedFiles}
                        isUploading={isUploading}
                        onRemove={(files: any) => onRemove(files)}
                        file={file}
                        setFile={setFile}
                    />
                </DialogContent>
                <Divider className="divider" />
                <DialogActions className="Dialog_Actions">
                    <Button
                        className="Button"
                        variant="outlined"
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        className="Button"
                        onClick={() => {
                            if (file.length > 0) {
                                finalUpload(file);
                            } else {
                                handleClose();
                            }
                        }}
                        disabled={isUploading}
                    >
                        Save
                    </Button>
                </DialogActions>
                {isUploading && <LinearProgress />}
            </Dialog>
        </>
    );
}

export default UploadDocument;
