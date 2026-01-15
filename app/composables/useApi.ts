/**
 * Custom API composable with automatic toast notifications
 * Use this instead of $fetch for automatic success/error toasts
 */
export const useApi = () => {
    const { success, error } = useToast();

    const api = async <T = any>(
        url: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            body?: any;
            silent?: boolean;
            successMessage?: string;
        } = {}
    ): Promise<T> => {
        const { method = 'GET', body, silent = false, successMessage } = options;

        try {
            const response = await $fetch<T>(url, {
                method,
                body
            });

            // Show success toast for mutations
            if (!silent && ['POST', 'PUT', 'DELETE'].includes(method)) {
                const msg = successMessage ||
                    (response as any)?.message ||
                    (method === 'DELETE' ? 'Deleted successfully' :
                        method === 'POST' ? 'Saved successfully' : 'Updated successfully');
                success(msg);
            }

            return response as T;
        } catch (err: any) {
            // Show error toast
            if (!silent) {
                const msg = err.data?.message || err.message || 'An error occurred';
                error(msg);
            }
            throw err;
        }
    };

    return { api };
};
