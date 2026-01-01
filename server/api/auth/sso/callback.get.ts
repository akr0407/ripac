import { findOrCreateSsoUser, type UserSession } from '../../../utils/auth';
import { logAuditAction } from '../../../utils/audit';

interface TokenResponse {
    access_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
}

interface IdTokenClaims {
    sub: string;
    email: string;
    name?: string;
    preferred_username?: string;
    nonce?: string;
}

function decodeJwt(token: string): IdTokenClaims {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    // Get state and code from query
    const { code, state, error, error_description } = query;

    // Check for errors from SSO provider
    if (error) {
        console.error('[SSO] Error from provider:', error, error_description);
        throw createError({
            statusCode: 400,
            message: `SSO login failed: ${error_description || error}`,
        });
    }

    if (!code || !state) {
        throw createError({
            statusCode: 400,
            message: 'Missing authorization code or state',
        });
    }

    // Verify state for CSRF protection
    const storedState = getCookie(event, 'sso_state');
    const storedNonce = getCookie(event, 'sso_nonce');

    if (state !== storedState) {
        throw createError({
            statusCode: 400,
            message: 'Invalid state parameter. Possible CSRF attack.',
        });
    }

    // Clear state cookies
    deleteCookie(event, 'sso_state');
    deleteCookie(event, 'sso_nonce');

    const { sso } = config;

    // Exchange code for tokens
    const tokenUrl = `${sso.issuerUrl}/token`;

    try {
        const tokenResponse = await $fetch<TokenResponse>(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: sso.clientId,
                client_secret: sso.clientSecret,
                code: code as string,
                redirect_uri: sso.redirectUri,
            }).toString(),
        });

        // Decode ID token to get user info
        const claims = decodeJwt(tokenResponse.id_token);

        // Verify nonce
        if (storedNonce && claims.nonce !== storedNonce) {
            throw createError({
                statusCode: 400,
                message: 'Invalid nonce. Possible replay attack.',
            });
        }

        // Find or create user
        const user = await findOrCreateSsoUser(
            'company-sso', // SSO provider ID
            claims.sub,
            claims.email,
            claims.name || claims.preferred_username || claims.email
        );

        // Create session
        const session: UserSession = {
            id: user.id,
            email: user.email,
            name: user.name,
            isSuperadmin: user.isSuperadmin,
            currentOrganizationId: user.organizations[0]?.id,
            currentOrganizationSlug: user.organizations[0]?.slug,
        };

        await setUserSession(event, { user: session });

        // Log audit action
        await logAuditAction(event, {
            userId: user.id,
            organizationId: session.currentOrganizationId,
            action: 'login',
            entityType: 'user',
            entityId: user.id,
            changes: { after: { method: 'sso' } },
        });

        // Redirect to home or dashboard
        if (user.organizations.length > 0) {
            return sendRedirect(event, `/org/${user.organizations[0].slug}`);
        }

        return sendRedirect(event, '/');

    } catch (err: any) {
        console.error('[SSO] Token exchange failed:', err);
        throw createError({
            statusCode: 500,
            message: 'Failed to complete SSO login. Please try again.',
        });
    }
});
