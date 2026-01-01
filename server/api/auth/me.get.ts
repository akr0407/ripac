import { getUserById } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (!session?.user) {
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
