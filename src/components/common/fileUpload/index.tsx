import { IconButton } from '@mui/material';
import './style.css';
import { useCallback } from 'react';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { UploadFileInput } from '@/assets/img';

function UploadContainer({
    onUpload,
    maxFiles,
    uploadedFiles,
    isUploading,
    onRemove,
    file,
    setFile,
}) {
    const onDrop = useCallback(
        (acceptedFiles: Array<File>) => {
            const newFiles = acceptedFiles.map((file) => {
                if (file.type.includes('image')) {
                    return Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    });
                } else {
                    return file;
                }
            });
            // Update state with new files
            const updatedFiles = file ? [...file, ...newFiles] : [newFiles];

            setFile(updatedFiles);
        },
        [file, maxFiles, onUpload, setFile],
    );
    const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
        useDropzone({
            accept: {
                'text/html': [
                    '.ppt',
                    '.pdf',
                    '.docx',
                    '.pptx',
                    '.doc',
                    '.csv',
                    '.xlsx ',
                    '.xls',
                    '.html',
                ],
            },
            onDrop,
            onDropRejected: (Rejectedfile) => {
                Rejectedfile.forEach((file) => {
                    file.errors.forEach((error) => {
                        if (error.code == 'file-invalid-type') {
                            toast.error(
                                'Uploaded file format is not supported. Please upload .pdf, .docx, .txt, .html, or .ppt format',
                                {
                                    duration: 2000,
                                },
                            );
                        }
                    });
                });
            },
        });
    function FileCard({ file, progress, onRemove, type }) {
        let localFile;
        if (file instanceof File) {
            localFile = file;
        } else {
            localFile = {
                name: file.fileName,
                size: file.fileSize * 1024,
            };
        }
        return (
            <div className="file-itembox">
                <p className="file_name">
                    <IconButton
                        size={'medium'}
                        type="button"
                        aria-label="Ask the Model"
                        onClick={() => {
                            if (type == 'local') {
                                onRemove();
                            } else {
                                onRemove(file);
                            }
                        }}
                    >
                        <DownloadOutlinedIcon fontSize="inherit" />
                    </IconButton>
                    {localFile.name}
                </p>
                {onRemove ? (
                    <IconButton
                        size={'medium'}
                        type="button"
                        aria-label="Ask the Model"
                        onClick={() => {
                            if (type == 'local') {
                                onRemove();
                            } else {
                                onRemove(file);
                            }
                        }}
                    >
                        <DeleteOutlinedIcon fontSize="inherit" />
                    </IconButton>
                ) : null}
            </div>
        );
    }
    function removeLocalFile(index) {
        if (!file) return;
        const newFiles = file.filter((_: any, i: number) => i !== index);
        setFile(newFiles);
    }
    return (
        <>
            <div className="file_upload_main_container">
                <div
                    {...getRootProps({ className: 'dropzone' })}
                    className="file_upload_box"
                >
                    <input
                        className="file_uploadinput_box"
                        type="file"
                        name="document"
                        {...getInputProps()}
                    />
                    <div className="upload_box">
                        <img src={UploadFileInput} />
                        <p className="file_text_title">
                            <b>Browse</b>
                            <span className="text_title">
                                or drop file to upload
                            </span>
                        </p>

                        <p className="file_type_text">
                            File format .pdf, .docx, .txt, .html, or .ppt
                        </p>
                    </div>
                </div>
                <div className="file_view_container">
                    {file?.length ? (
                        <>
                            {file?.map((file: any, index: number) => (
                                <FileCard
                                    key={index}
                                    file={file}
                                    onRemove={() => {
                                        removeLocalFile(index);
                                    }}
                                    progress={100}
                                    type="local"
                                />
                            ))}
                        </>
                    ) : null}
                    {uploadedFiles?.length ? (
                        <>
                            {uploadedFiles?.map((file: any, index: number) => (
                                <FileCard
                                    key={index}
                                    file={file}
                                    onRemove={onRemove}
                                    progress={100}
                                    type="uploaded"
                                />
                            ))}
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}

export default UploadContainer;
