export const PIXELS = {
    getChatRooms: (projectId: string) =>
        `GetUserConversationRooms(project = "${projectId}")`,
    GetUserInfo: () => `GetUserInfo()`,
    removeUserRoom: (roomId: string) =>
        `RemoveUserRoom(roomId = ["${roomId}"])`,
    removeAllRoom: (rooms: any) => {
        console.log('rooms', rooms);
        return `RemoveUserRoom(roomId =${JSON.stringify(rooms)})`;
    },
    openRoom: () => `OpenUserRoom()`,
    setRoomName: (roomId: string, newRoomName: string) =>
        `SetRoomName(roomId = ["${roomId}"], roomName = ["${newRoomName}"])`,
    getRoomMessages: (roomId: string) =>
        `GetRoomMessages(roomId=["${roomId}"])`,
    addToVectorDB: (
        db: string,
        filePath: string[] | string,
        paramValues?: Record<string, string | string[]>,
    ) =>
        `CreateEmbeddingsFromDocuments (engine = "${db}", filePaths = ${JSON.stringify(
            filePath,
        )})`,
    CreateVectorDatabaseEngine: (database: string[], conDetails: any) =>
        `CreateVectorDatabaseEngine(database=${JSON.stringify(
            database,
        )},conDetails=${JSON.stringify(conDetails)})`,
    // , paramValues=[${JSON.stringify(paramValues)}])`
    deleteDocsFromVectorDB: (
        db: string,
        docsName: string,
        paramValues?: Record<string, string | string[]>,
    ) => {
        if (paramValues) {
            return `RemoveDocumentFromVectorDatabase(engine = "${db}", fileNames=["${docsName}"], paramValues=[${JSON.stringify(
                paramValues,
            )}])`;
        } else {
            return `RemoveDocumentFromVectorDatabase(engine = "${db}", fileNames=["${docsName}"])`;
        }
    },
    deleteAllDocsFromVectorDB: (
        db: string,
        docs: string,
        paramValues?: Record<string, string | string[]>,
    ) => {
        if (paramValues) {
            return `RemoveDocumentFromVectorDatabase(engine = "${db}", fileNames=[${JSON.stringify(
                docs,
            )}], paramValues=[${JSON.stringify(paramValues)}])`;
        } else {
            return `RemoveDocumentFromVectorDatabase(engine = "${db}", fileNames=[${JSON.stringify(
                docs,
            )}])`;
        }
    },

    getAllDocuments: (
        db: string,
        paramValues?: Record<string, string | string[]>,
    ) => {
        if (paramValues) {
            return `ListDocumentsInVectorDatabase(engine="${db}")`;
        } else {
            return `ListDocumentsInVectorDatabase(engine="${db}")`;
        }
    },
    getContextFromVectorDB: (
        db: string,
        query: string,
        limit: any = 3,
        files: any,
        paramValues?: Record<string, string | string[]>,
    ) => {
        if (paramValues) {
            return `VectorDatabaseQuery (engine = "${db}", command = "${query}",fileNames=${JSON.stringify(
                files,
            )},limit = ${limit}, paramValues=[${JSON.stringify(paramValues)}])`;
        } else {
            return `VectorDatabaseQuery (engine = "${db}", command = "${query}",fileNames=${JSON.stringify(
                files,
            )}, limit = ${limit})`;
        }
    },
    askModel: (
        modelID: string,
        question: string,
        context?: string,
        tokenLength?: number,
        temperature?: number,
    ) => {
        if (context) {
            return `LLM(engine=["${modelID}"], command=["<encode>${question}</encode>"], context=["<encode>${context}</encode>"], paramValues=[${JSON.stringify(
                {
                    max_new_tokens: tokenLength || 2000,
                    temperature: temperature || 0.4,
                },
            )}])`;
        } else {
            return `LLM(engine=["${modelID}"], command=["<encode>${question}</encode>"], paramValues=[${JSON.stringify(
                {
                    max_new_tokens: tokenLength || 2000,
                    temperature: temperature || 0.4,
                },
            )}])`;
        }
    },
    downloadAsset: (filePath: string[] | string, space: string) =>
        `DownloadAsset(filePath=[${JSON.stringify(
            filePath,
        )}], space=["${space}"])`,
};
