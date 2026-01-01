// Extend the nuxt-auth-utils User type with our custom session fields
declare module '#auth-utils' {
    interface User {
        id: string;
        email: string;
        name: string;
        isSuperadmin: boolean;
        currentOrganizationId?: string;
        currentOrganizationSlug?: string;
    }
}

export { };
