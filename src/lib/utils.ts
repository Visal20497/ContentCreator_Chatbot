import { VectorDatabaseQueryResult } from './types';

export function convertBytes(bytesNum: number): string {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.min(
        Math.floor(Math.log(bytesNum) / Math.log(1024)),
        units.length - 1,
    );
    if (i === 0) {
        return `${bytesNum} ${units[i]}`;
    } else {
        return `${(bytesNum / 1024 ** i).toFixed(1)} ${units[i]}`;
    }
}

export function getHighScoringData(
    data: VectorDatabaseQueryResult[],
    scoreRange: number[],
) {
    const [min, max] = scoreRange;
    return data.filter((item) => item.Score > min && item.Score < max);
}

export function extractSourceFromLLM(response: string) {
    const sourceIndex = response.indexOf('Source:');
    const sourceIndex2 = response.indexOf('source:');
    let result: string[] = [];
    if (sourceIndex > -1 || sourceIndex2 > -1) {
        const source = response.slice(sourceIndex + 'Source:'.length).trim();
        if (source === 'unknown') {
            result = [];
        }
        try {
            result = JSON.parse(source);
        } catch (error) {
            console.warn('Error parsing source from LLM response', error);
            result = [];
        }
        const withoutSourceText = response.slice(0, sourceIndex - 1);
        return {
            source: result,
            text: withoutSourceText,
        };
    } else {
        return {
            source: [],
            text: response,
        };
    }
}
