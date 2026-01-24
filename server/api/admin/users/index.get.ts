import { db } from "../../../db";
import { users, memberships, organizations } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Not authenticated",
    });
  }

  // Check if user is superadmin
  if (!session.user.isSuperadmin) {
    throw createError({
      statusCode: 403,
      message: "Superadmin access required",
    });
  }

  const rows = await db.select({
        user: users,
        membership: memberships,
        organization: organizations,
    })
    .from(users)
    .leftJoin(memberships, eq(users.id, memberships.userId))
    .leftJoin(organizations, eq(memberships.organizationId, organizations.id))
    .orderBy(desc(users.createdAt));

    // Aggregate users and their organizations
    const usersMap = new Map();
    
    for (const row of rows) {
        if (!usersMap.has(row.user.id)) {
            usersMap.set(row.user.id, {
                id: row.user.id,
                name: row.user.name,
                email: row.user.email,
                isSuperadmin: row.user.isSuperadmin,
                isActive: row.user.isActive,
                lastLoginAt: row.user.lastLoginAt,
                createdAt: row.user.createdAt,
                organizations: []
            });
        }
        
        if (row.organization && row.membership) {
            usersMap.get(row.user.id).organizations.push({
                id: row.organization.id,
                name: row.organization.name,
                role: row.membership.role,
            });
        }
    }

  return {
    users: Array.from(usersMap.values()),
  };
});
