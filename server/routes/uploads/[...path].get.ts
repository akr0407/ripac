
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { createReadStream } from 'fs';

export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, 'path');
    const filename = path || '';

    // Security check: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw createError({ statusCode: 400, message: 'Invalid filename' });
    }

    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, filename);

    try {
        await stat(filePath);
        return sendStream(event, createReadStream(filePath));
    } catch (e) {
        throw createError({ statusCode: 404, message: 'File not found' });
    }
});
