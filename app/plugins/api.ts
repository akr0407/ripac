import { FetchError } from 'ofetch';

export default defineNuxtPlugin(() => {
    const { success, error } = useToast();

    // Use Nuxt's global fetch interceptors
    const originalFetch = globalThis.$fetch;

    // Override with wrapped version
    // @ts-ignore - We're extending $fetch
    globalThis.$fetch = $fetch.create({
        async onRequest({ options }) {
            // Can add auth headers here if needed
        },
        async onResponse({ request, response, options }) {
            // Only show toast for mutations
            const method = (options.method || 'GET').toString().toUpperCase();

            // Skip if silent mode or GET request
            if ((options as any).silent || method === 'GET') return;

            // Check if it's an API call
            const url = typeof request === 'string' ? request : request.toString();
            if (!url.includes('/api/')) return;

            // Show success toast
            const data = response._data;
            if (data && typeof data === 'object') {
                const msg = data.message ||
                    (method === 'DELETE' ? 'Deleted successfully' :
                        method === 'POST' ? 'Saved successfully' : 'Updated successfully');
                success(msg);
            }
        },
        async onResponseError({ request, response, options }) {
            // Skip if silent mode
            if ((options as any).silent) return;

            // Check if it's an API call
            const url = typeof request === 'string' ? request : request.toString();
            if (!url.includes('/api/')) return;

            // Show error toast
            const data = response._data;
            const msg = data?.message || response.statusText || 'An error occurred';
            error(msg);
        }
    });
});
