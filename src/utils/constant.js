export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes, 1MB = 1024 * 1024 bytes

export const getChatName = (name) => {
    const words = name.split(' ');
    const firstFourWords = words.slice(0, 4);
    return firstFourWords.join(' ');
};
