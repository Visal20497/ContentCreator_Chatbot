export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes, 1MB = 1024 * 1024 bytes

export const SUPPORTED_FILETYPE = [
    'application/pdf',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // "application/vnd.ms-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const SUPPORTED_FILETYPE_EXT = {
    'application/pdf': [],
    'text/csv': [],
    'application/msword': [],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        [],
    // "application/vnd.ms-excel": [],
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
};

export const COLOR_EXTENTION_MAP: { [key: string]: string } = {
    pdf: '#ff0000',
    doc: '#2b579a',
    docx: '#2b579a',
    xls: '#2b579a',
    xlsx: '#2b579a',
    ppt: '#d24726',
    pptx: '#d24726',
    txt: '#008000',
    jpg: '#d4af37',
    jpeg: '#d4af20',
    png: '#4fb6f4',
    gif: '#000000',
    svg: '#FF9900',
    'svg+xml': '#FF9900',
    mp4: '#000000',
    mov: '#000000',
    webm: '#000000',
    avi: '#000000',
    md: '#002244',
    json: '#ff6238',
    JS: '#f1e05a',
    TS: '#007acc',
    tsx: '#007acc',
};

export const MIME_TYPES: { [key: string]: string } = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'application/docx',
    'application/msword': 'application/doc',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        'application/pptx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'application/xlsx',
    'application/vnd.ms-excel': 'application/xls',
    'application/pdf': 'application/pdf',
    'application/vnd.oasis.opendocument.text': 'application/odt',
    'application/vnd.oasis.opendocument.spreadsheet': 'application/ods',
    'application/vnd.oasis.opendocument.presentation': 'application/odp',
    'application/zip': 'application/zip',
    'application/x-7z-compressed': 'application/7z',
    'application/x-rar-compressed': 'application/rar',
    'application/x-tar': 'application/tar',
    'application/x-bzip': 'application/bzip',
    'application/x-bzip2': 'application/bzip2',
    'application/x-xz': 'application/xz',
    'application/x-lzip': 'application/lzip',
    'application/x-lzma': 'application/lzma',
    'application/x-lzop': 'application/lzop',
    'application/x-snappy-framed': 'application/snappy',
    'application/xz': 'application/xz',
    'application/gzip': 'application/gzip',
    'application/x-gzip': 'application/gzip',
    'application/x-gtar': 'application/gtar',
    'application/xhtml+xml': 'application/xhtml',
    'application/xml': 'application/xml',
    'application/json': 'application/json',
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/svg+xml': 'image/svg',
    'text/plain': 'text/plain',
    'text/csv': 'text/csv',
    'text/html': 'text/html',
    'text/css': 'text/css',
    'text/javascript': 'text/JS',
    'text/markdown': 'text/md',
    'video/mp4': 'video/mp4',
    'video/mp2t': 'video/TS',
};

export const ENDPOINT = process.env.ENDPOINT;
export const VECTORDB_ENGINE = process.env.VECTOR_DB_ID;
export const MODEL_ENGINE = process.env.MODEL_ID;
export const APPID = process.env.APPID;
