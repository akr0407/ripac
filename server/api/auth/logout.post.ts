import { logAuditAction } from '../../utils/audit';

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);

    if (session?.user) {
        // Log audit action
        await logAuditAction(event, {
            userId: session.user.id,
            organizationId: session.user.currentOrganizationId,
            action: 'logout',
            entityType: 'user',
            entityId: session.user.id,
        });
    }

    await clearUserSession(event);

    return {
        message: 'Logged out successfully',
    };
});
