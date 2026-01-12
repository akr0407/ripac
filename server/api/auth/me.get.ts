import { getUserById } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
        // Debug logging for lost session
        try {
            const fs = await import('fs');
            const path = await import('path');
            const logPath = path.resolve(process.cwd(), 'server-debug.log');
            const logMessage = `
[${new Date().toISOString()}] Auth Check Failed (me.get.ts):
URL: ${event.node.req.url}
Headers: ${JSON.stringify(event.node.req.headers)}
Session: ${JSON.stringify(session)}
----------------------------------------
`;
            fs.appendFileSync(logPath, logMessage);
        } catch (e) {
            console.error('Failed to write debug log', e);
        }

        throw createError({
            statusCode: 401,
            message: 'Not authenticated',
        });
    }

    // Get fresh user data with organizations
    const user = await getUserById(session.user.id);

    if (!user) {
        await clearUserSession(event);
        throw createError({
            statusCode: 401,
            message: 'User not found',
        });
    }

    return {
        user: {
            ...user,
            currentOrganizationId: session.user.currentOrganizationId,
            currentOrganizationSlug: session.user.currentOrganizationSlug,
        },
    };
});
