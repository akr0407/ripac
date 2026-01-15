export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

const toasts = ref<Toast[]>([]);

export const useToast = () => {

    const add = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        toasts.value.push({ id, message, type, duration });

        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
    };

    const remove = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    };

    const success = (message: string, duration?: number) => add(message, 'success', duration);
    const error = (message: string, duration?: number) => add(message, 'error', duration);
    const warning = (message: string, duration?: number) => add(message, 'warning', duration);
    const info = (message: string, duration?: number) => add(message, 'info', duration);

    return {
        toasts,
        add,
        remove,
        success,
        error,
        warning,
        info
    };
};
