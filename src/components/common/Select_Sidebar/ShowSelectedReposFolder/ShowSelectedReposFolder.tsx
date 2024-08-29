import { useEffect, useState } from 'react';
import Select from 'react-select';
import {
    Button,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Dialog,
} from '@mui/material';
import { useKnowledgeBase } from '@/contexts/FilesContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { runPixel } from '@semoss/sdk';
import { PIXELS } from '@/providers/pixels';
import toast from 'react-hot-toast';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import './style.css';

function ShowSelectedReposFolder({
    handleClose,
    setIsSelectedRepos,
    isSelectedRepos,
    options,
    vectordbFiles,
    setSelectedRepoShow,
    selectedRepoShow,
}) {
    const {
        knowledgebaseData,
        setKnowledgebaseData,
        selectedFilesData,
        setSelectedFilesData,
        setDbSelectedFilesData,
        dbSelectedFilesData,
        setVectordbFiles,
    } = useKnowledgeBase();
    const [dbDocuments, setDbDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const [currentItems, setCurrentItems] = useState([]);
    const totalPages = Math.ceil(dbDocuments.length / 4);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        const indexOfLastItem = currentPage * 4;
        const indexOfFirstItem = indexOfLastItem - 4;

        // const totalPages = Math.ceil(items.length / itemsPerPage);
        const start = (currentPage - 1) * 4;
        const end = Math.min(start + 4, Object.keys(dbDocuments).length);
        setStartIndex(start);
        setEndIndex(end);
        setCurrentItems(dbDocuments.slice(indexOfFirstItem, indexOfLastItem));
    }, [currentPage, dbDocuments]);

    const handleGetSelectedFiles = (selectedOption) => {
        setSelectedRepoShow(selectedOption);
        setCurrentPage(1);
        setDbDocuments([]);
    };

    const handleFileSelector = (event, item, all) => {
        if (all === 'all') {
            setSelectedFilesData((prevSelectedItems) => {
                const updatedSelectedItems = {};
                Object.keys(prevSelectedItems).forEach((fileName) => {
                    updatedSelectedItems[fileName] =
                        !prevSelectedItems[fileName];
                });
                return updatedSelectedItems;
            });
        } else {
            setSelectedFilesData((prevSelectedItems) => ({
                ...prevSelectedItems,
                [item.fileName]: !prevSelectedItems[item.fileName],
            }));
        }
    };

    useEffect(() => {
        if (vectordbFiles.length > 0 && selectedRepoShow) {
            let files = vectordbFiles.filter(
                (item) => item.name === selectedRepoShow?.label,
            );
            if (files.length > 0) {
                // setSelectedFilesData((prev) => [...prev, ...files[0].files]);
                const finalFiles = files[0].files;
                const initialSelectedItems = files[0].files.reduce(
                    (acc, item) => {
                        acc[item.fileName] =
                            selectedFilesData[item.fileName] ?? true;
                        return acc;
                    },
                    {},
                );
                setDbDocuments(files[0].files);

                setSelectedFilesData((prevSelectedItems) => ({
                    ...prevSelectedItems,
                    ...initialSelectedItems,
                }));
            }
        }
    }, [selectedRepoShow, vectordbFiles]);
    console.log('selectedFilessapp', selectedFilesData);
    function handleSave() {
        const allFiles = [];
        const folderDict = {};
        vectordbFiles.forEach((Mainelement) => {
            Mainelement.files.forEach((element) => {
                const fileWithFolder = {
                    ...element,
                    name: Mainelement.name,
                    value: Mainelement.value,
                };

                // Add file to the corresponding folder array in the dictionary
                if (!folderDict[Mainelement.name]) {
                    folderDict[Mainelement.name] = {
                        name: Mainelement.name,
                        value: Mainelement.value,
                        files: [],
                    };
                }
                folderDict[Mainelement.name].files.push(fileWithFolder);
            });
        });
        const savedItems = allFiles.filter(
            (item) => selectedFilesData[item.fileName],
        );
        const saveddItems = Object.values(folderDict).map((folder: any) => ({
            ...folder,
            files: folder.files.filter(
                (item) => selectedFilesData[item.fileName],
            ),
        }));
        const separatedFilesByFolder = Object.values(folderDict);

        // setVectordbFiles(saveddItems);
        setDbSelectedFilesData(saveddItems);
        handleClose();
    }
    console.log('vectorDBFiles', dbDocuments);
    const areAllItemsSelected = (selectedItems, items) => {
        console.log('selectedItems', selectedItems, items);
        return items.length > 0
            ? items.every((item) => selectedItems[item.fileName] === true)
            : false;
    };
    return (
        <div>
            <Dialog
                className="upload-container"
                onClose={handleClose}
                open={isSelectedRepos}
            >
                <DialogContent className="knowledge-upload-container">
                    <label className="select-label">
                        Selected Knowledge Repository
                    </label>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        onChange={handleGetSelectedFiles}
                        options={options}
                        value={selectedRepoShow}
                    />
                    <div
                        className="check-item-box"
                        style={{
                            alignItems: isLoading && 'center',
                            justifyContent: isLoading && 'center',
                        }}
                    >
                        {isLoading && <CircularProgress />}
                        {!isLoading && dbDocuments.length > 0 ? (
                            <>
                                {dbDocuments.length > 0 && (
                                    <div className="select-file-input">
                                        <FormControlLabel
                                            control={<Checkbox size="small" />}
                                            label={'All'}
                                            checked={areAllItemsSelected(
                                                selectedFilesData,
                                                dbDocuments,
                                            )}
                                            onChange={(event) =>
                                                handleFileSelector(
                                                    event,
                                                    null,
                                                    'all',
                                                )
                                            }
                                        />
                                        <p className="select-pragraph">
                                            {selectedFilesData.length}/
                                            {dbDocuments.length}
                                        </p>
                                    </div>
                                )}

                                {currentItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="select-file-input"
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={
                                                        !!selectedFilesData[
                                                            item.fileName
                                                        ]
                                                    }
                                                    onChange={(event) =>
                                                        handleFileSelector(
                                                            event,
                                                            item,
                                                            '',
                                                        )
                                                    }
                                                />
                                            }
                                            label={item.fileName}
                                        />
                                    </div>
                                ))}
                            </>
                        ) : !isLoading ? (
                            <p style={{ textAlign: 'center' }}>No Documents</p>
                        ) : null}
                    </div>
                    {currentItems.length > 0 && (
                        <div className="pagination-actions">
                            <p>
                                {startIndex + 1}-{endIndex} of{' '}
                                {dbDocuments.length}
                            </p>
                            <ArrowBackIosIcon
                                style={{ cursor: 'pointer' }}
                                onClick={handlePrev}
                                fontSize="small"
                            />
                            <ArrowForwardIosIcon
                                fontSize="small"
                                style={{ cursor: 'pointer' }}
                                onClick={handleNext}
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        className="close_button"
                        onClick={handleClose}
                        variant="outlined"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ShowSelectedReposFolder;
