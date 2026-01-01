import { H3Event } from 'h3';
import { db } from '../db';
import { auditLogs, type NewAuditLog } from '../db/schema';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export';

export interface AuditLogParams {
    userId?: string | null;
    organizationId?: string | null;
    action: AuditAction;
    entityType: string;
    entityId?: string | null;
    changes?: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        fields?: string[];
    };
}

/**
 * Extract IP address from H3 event
 */
function getIpAddress(event: H3Event): string | undefined {
    const forwarded = getHeader(event, 'x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim();
    }
    const realIp = getHeader(event, 'x-real-ip');
    if (realIp) {
        return realIp;
    }
    return undefined;
}

/**
 * Log an action to the audit log
 */
export async function logAuditAction(
    event: H3Event,
    params: AuditLogParams
): Promise<void> {
    try {
        const ipAddress = getIpAddress(event);
        const userAgent = getHeader(event, 'user-agent');

        const logEntry: NewAuditLog = {
            userId: params.userId,
            organizationId: params.organizationId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            changes: params.changes,
            ipAddress,
            userAgent,
        };

        await db.insert(auditLogs).values(logEntry);
    } catch (error) {
        // Log error but don't throw - audit logging should not break the main operation
        console.error('[Audit] Failed to log action:', error);
    }
}

/**
 * Helper to calculate changes between two objects
 */
export function calculateChanges(
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null
): AuditLogParams['changes'] {
    if (!before && !after) return undefined;

    const changes: AuditLogParams['changes'] = {};
    const fields: string[] = [];

    if (before) changes.before = before;
    if (after) changes.after = after;

    // Calculate which fields changed
    if (before && after) {
        for (const key of Object.keys(after)) {
            if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
                fields.push(key);
            }
        }
        if (fields.length > 0) {
            changes.fields = fields;
        }
    }

    return Object.keys(changes).length > 0 ? changes : undefined;
}
