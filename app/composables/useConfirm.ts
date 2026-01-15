export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState {
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
}

const state = ref<ConfirmState>({
    isOpen: false,
    options: { message: '' },
    resolve: null
});

export const useConfirm = () => {
    const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
        return new Promise((resolve) => {
            state.value = {
                isOpen: true,
                options: typeof options === 'string' ? { message: options } : options,
                resolve
            };
        });
    };

    const handleConfirm = () => {
        state.value.resolve?.(true);
        state.value.isOpen = false;
    };

    const handleCancel = () => {
        state.value.resolve?.(false);
        state.value.isOpen = false;
    };

    return {
        state,
        confirm,
        handleConfirm,
        handleCancel
    };
};
