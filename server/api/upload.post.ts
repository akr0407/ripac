
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export default defineEventHandler(async (event) => {
    // Ensure user is authenticated (optional, but good practice)
    const session = await requireUserSession(event);

    const files = await readMultipartFormData(event);
    if (!files || files.length === 0) {
        throw createError({ statusCode: 400, message: 'No file uploaded' });
    }

    const uploadedFile = files[0]; // Take first file
    const fileExt = uploadedFile.filename?.split('.').pop() || 'png';
    const fileName = `${randomUUID()}.${fileExt}`;

    // Save to uploads directory (this will be mounted in Docker)
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, uploadedFile.data);

    return {
        url: `/uploads/${fileName}`,
        filename: fileName
    };
});
