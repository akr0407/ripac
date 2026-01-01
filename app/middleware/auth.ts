export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip middleware for login page
    if (to.path === '/login') {
        return;
    }

    // Get auth state
    const { isAuthenticated, fetchUser, user } = useAuth();

    // Fetch user if not already loaded
    if (!isAuthenticated.value) {
        await fetchUser();
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated.value) {
        return navigateTo('/login');
    }

    // Check superadmin access for admin routes
    if (to.path.startsWith('/admin') && !user.value?.isSuperadmin) {
        throw createError({
            statusCode: 403,
            message: 'Access denied. Superadmin privileges required.',
        });
    }

    // Check organization access for org routes
    if (to.path.startsWith('/org/')) {
        const orgSlug = to.params.org as string;

        if (orgSlug && user.value) {
            const hasAccess = user.value.isSuperadmin ||
                user.value.organizations.some(o => o.slug === orgSlug);

            if (!hasAccess) {
                throw createError({
                    statusCode: 403,
                    message: 'You do not have access to this organization.',
                });
            }
        }
    }
});
