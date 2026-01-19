interface Organization {
    id: string;
    name: string;
    slug: string;
    role: string;
    logo?: string | null;
}

interface User {
    id: string;
    email: string;
    name: string;
    isSuperadmin: boolean;
    currentOrganizationId?: string;
    currentOrganizationSlug?: string;
    organizations: Organization[];
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const state = useState<AuthState>('auth', () => ({
        user: null,
        loading: true,
        error: null,
    }));

    const { loggedIn, user: sessionUser, session, fetch: fetchSession, clear: clearSession } = useUserSession();

    const isAuthenticated = computed(() => !!state.value.user);
    const currentOrganization = computed(() => {
        if (!state.value.user) return null;
        return state.value.user.organizations.find(
            o => o.id === state.value.user?.currentOrganizationId
        );
    });

    /**
     * Fetch current user profile
     */
    async function fetchUser() {
        state.value.loading = true;
        state.value.error = null;

        try {
            const response = await $fetch<{ user: User }>('/api/auth/me');
            state.value.user = response.user;
        } catch (err: any) {
            state.value.user = null;
            if (err.statusCode !== 401) {
                state.value.error = err.message || 'Failed to fetch user';
            }
        } finally {
            state.value.loading = false;
        }
    }

    /**
     * Login with email and password
     */
    async function login(email: string, password: string) {
        state.value.loading = true;
        state.value.error = null;

        try {
            const response = await $fetch<{ user: User }>('/api/auth/login', {
                method: 'POST',
                body: { email, password },
            });
            state.value.user = response.user;
            return { success: true };
        } catch (err: any) {
            state.value.error = err.data?.message || err.message || 'Login failed';
            return { success: false, error: state.value.error };
        } finally {
            state.value.loading = false;
        }
    }

    /**
     * Logout
     */
    async function logout() {
        state.value.loading = true;

        try {
            await $fetch('/api/auth/logout', { method: 'POST' });
            state.value.user = null;
            await clearSession();
            await navigateTo('/login');
        } catch (err: any) {
            console.error('Logout failed:', err);
        } finally {
            state.value.loading = false;
        }
    }

    /**
     * Redirect to SSO login
     */
    function loginWithSSO() {
        window.location.href = '/api/auth/sso';
    }

    /**
     * Switch current organization
     */
    async function switchOrganization(organizationId: string) {
        state.value.loading = true;
        state.value.error = null;

        try {
            const response = await $fetch<{ currentOrganizationId: string; currentOrganizationSlug: string }>(
                '/api/auth/switch-org',
                {
                    method: 'POST',
                    body: { organizationId },
                }
            );

            if (state.value.user) {
                state.value.user.currentOrganizationId = response.currentOrganizationId;
                state.value.user.currentOrganizationSlug = response.currentOrganizationSlug;
            }

            // Navigate to new org
            await navigateTo('/');

            return { success: true };
        } catch (err: any) {
            state.value.error = err.data?.message || err.message || 'Failed to switch organization';
            return { success: false, error: state.value.error };
        } finally {
            state.value.loading = false;
        }
    }

    /**
     * Check if user has a specific role in current organization
     */
    function hasRole(role: string | string[]) {
        const org = currentOrganization.value;
        if (!org) return false;

        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(org.role);
    }

    /**
     * Check if user can perform admin actions
     */
    const isAdmin = computed(() => {
        return state.value.user?.isSuperadmin || hasRole(['owner', 'admin']);
    });

    return {
        // State
        user: computed(() => state.value.user),
        loading: computed(() => state.value.loading),
        error: computed(() => state.value.error),
        isAuthenticated,
        currentOrganization,
        isAdmin,

        // Actions
        fetchUser,
        login,
        logout,
        loginWithSSO,
        switchOrganization,
        hasRole,
    };
}
