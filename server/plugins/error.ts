
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
