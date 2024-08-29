export const PROMTS = {
    withContext: (
        context: string,
        userQuestion: string,
        sourceList: string[],
    ) =>
        `role: You are a highly intelligent AI assistant tasked with answering questions derived from provided document contexts. do not start with according to provided document or context. Just directly answer the question or task. context: ${context}. question: ${userQuestion}. source: ${JSON.stringify(
            sourceList,
        )}, please always return me the source as it is. if the source is not available, please return me the source as 'unknown'`,
};
