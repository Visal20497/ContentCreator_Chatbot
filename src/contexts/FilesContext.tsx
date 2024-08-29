// KnowledgeBaseContext.tsx
import React, {
    createContext,
    useContext,
    FC,
    ReactNode,
    useState,
} from 'react';

interface Knowledgebase {
    defaultKnowledgeBase: any[];
    KnowledgeBase: any[];
    UploadedFiles: any[];
}

interface KnowledgebaseContextProps {
    settingsData: any;
    setSettingsData: any;
    selectedFilesData: any;
    setSelectedFilesData: any;
    dbSelectedFilesData: any;
    setDbSelectedFilesData: any;
    knowledgebaseData: Knowledgebase;
    setKnowledgebaseData: React.Dispatch<React.SetStateAction<Knowledgebase>>;
    vectordbFiles: any;
    setVectordbFiles: any;
}

const KnowledgeBaseContext = createContext<
    KnowledgebaseContextProps | undefined
>(undefined);

interface KnowledgebaseProviderProps {
    children: ReactNode;
}

const KnowledgebaseProvider: FC<KnowledgebaseProviderProps> = ({
    children,
}) => {
    const [settingsData, setSettingsData] = useState({
        NumberOfQuery: null,
        tokenLength: null,
        temperature: null,
    });
    const [selectedFilesData, setSelectedFilesData] = useState([]);
    const [dbSelectedFilesData, setDbSelectedFilesData] = useState([]);
    const [vectordbFiles, setVectordbFiles] = useState([]);
    const [knowledgebaseData, setKnowledgebaseData] = useState<Knowledgebase>({
        defaultKnowledgeBase: [],
        KnowledgeBase: [],
        UploadedFiles: [],
    });

    return (
        <KnowledgeBaseContext.Provider
            value={{
                knowledgebaseData,
                setKnowledgebaseData,
                settingsData,
                setSettingsData,
                selectedFilesData,
                setSelectedFilesData,
                dbSelectedFilesData,
                setDbSelectedFilesData,
                vectordbFiles,
                setVectordbFiles,
            }}
        >
            {children}
        </KnowledgeBaseContext.Provider>
    );
};

const useKnowledgeBase = () => {
    const context = useContext(KnowledgeBaseContext);
    if (context === undefined) {
        throw new Error(
            'useKnowledgeBase must be used within a KnowledgebaseProvider',
        );
    }
    return context;
};

export { KnowledgebaseProvider, useKnowledgeBase };
