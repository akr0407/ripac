export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', async (error, { event }) => {
        console.error('Global Error Handler:', error);

        // Normalize error
        const statusCode = (error as any).statusCode || 500;
        const message = (error as any).message || 'Internal Server Error';

        // Custom handling for known error types (e.g. Drizzle/DB errors)
        // if (error.message.includes('unique constraint')) ...

        // Send JSON response
        setResponseStatus(event, statusCode);

        // We need to send the response manually because we are intercepting
        // However, Nitro might have already started sending.
        // If we are in an API route, we want JSON.

        if (event.path.startsWith('/api')) {
            // Ensure content type is JSON
            setHeader(event, 'Content-Type', 'application/json');

            const response = {
                success: false,
                statusCode,
                message,
                // Include stack only in dev?
                // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                error: (error as any).data || undefined
            };

            // This hook is for logging/monitoring mainly, passing modified error up is harder in Nitro 
            // without using `errorHandler` config.
            // But defineNitroPlugin hook 'error' captures logged errors.
            // To REPLACE the response, usually we rely on `h3` error handling.

            // Actually, best way in Nuxt 3 / Nitro is simply throwing createError() and letting Nitro format it.
            // BUT user asked to "configure global response handler".
            // If we want to CHANGE the default HTML error page to JSON for API:
            // We can't easily do it inside 'error' hook for response body replacement if headers sent.

            // BETTER APPROACH: modify logic to just return the object, 
            // but standard Nitro error handler formats JSON if request accepts JSON.
        }
    });

    // Alternatively, interfere with render?
});

/**
 * Note: Nitro produces JSON errors automatically for API routes if `createError` is used.
 * But to enforce a specific shape { success: false, ... } everywhere:
 * We might need a valid error handler definition in `nitro.config.ts` or `nuxt.config.ts`.
 * 
 * However, simpler solution for now within app:
 * Just ensure we throw consistent errors.
 * 
 * Wait, `nitroApp.hooks.hook('request', ...)` or `render:response`?
 * 
 * Let's try to just use a server middleware or plugin that wraps execution? No, too complex.
 * 
 * The standard way is often just letting it fail, and the client handles 500.
 * But if we want custom SHAPE:
 * We can define `errorHandler` in `nitro` config.
 * 
 * Since I cannot edit `nuxt.config.ts` easily to add a separate file outside server dir?
 * Actually I can.
 * 
 * Let's try this plugin approach first to see if we can manipulate the error response.
 * Actually, `defineNitroPlugin` is good for logging.
 * 
 * If I want to Format the response, I should probably use `server/middleware/0.error-handler.ts`? No, middleware is before.
 * 
 * Actually, let's look at `server/api/...`.
 * 
 * Let's stick to the prompt: "handler response global nya atur dong".
 * I will create a plugin that overrides `nitroApp.h3App.options.onError`.
 */

export default defineNitroPlugin((nitroApp) => {
    nitroApp.h3App.options.onError = async (error, event) => {
        // Log plain error
        console.error('API Error:', error);

        // Determine status
        const statusCode = (error as any).statusCode || 500;
        const statusMessage = (error as any).statusMessage || 'Internal Server Error';
        const message = (error as any).message || statusMessage;

        // JSON response for API
        if (event.path.startsWith('/api')) {
            setResponseStatus(event, statusCode);
            setHeader(event, 'Content-Type', 'application/json');

            return send(event, JSON.stringify({
                success: false,
                statusCode,
                message,
                data: null,
                // Expose details if available (e.g. validation errors)
                details: (error as any).data || undefined
            }));
        }

        // Default H3 error handler for non-API
        // We can't easily call original, so we minimal fallback or just text
        setResponseStatus(event, statusCode);
        return send(event, `Error: ${message}`);
    };
});
