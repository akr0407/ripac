import { findOrCreateSsoUser, type UserSession } from '../../../utils/auth';
import { logAuditAction } from '../../../utils/audit';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    // Build authorization URL
    const { sso } = config;

    if (!sso.clientId || !sso.issuerUrl) {
        throw createError({
            statusCode: 500,
            message: 'SSO is not configured. Please set SSO_CLIENT_ID and SSO_ISSUER_URL environment variables.',
        });
    }

    // Generate state and nonce for security
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    // Store state in cookie for CSRF protection
    setCookie(event, 'sso_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax',
    });

    setCookie(event, 'sso_nonce', nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax',
    });

    // Build authorization URL
    const authUrl = new URL(`${sso.issuerUrl}/authorize`);
    authUrl.searchParams.set('client_id', sso.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', sso.redirectUri);
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);

    return sendRedirect(event, authUrl.toString());
});
