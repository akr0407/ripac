import { onMounted, onUnmounted } from 'vue';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    handler: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    function handleKeydown(event: KeyboardEvent) {
        for (const shortcut of shortcuts) {
            const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const altMatch = shortcut.alt ? event.altKey : !event.altKey;
            const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

            if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
                event.preventDefault();
                shortcut.handler();
                return;
            }
        }
    }

    onMounted(() => {
        if (import.meta.client) {
            window.addEventListener('keydown', handleKeydown);
        }
    });

    onUnmounted(() => {
        if (import.meta.client) {
            window.removeEventListener('keydown', handleKeydown);
        }
    });

    return { shortcuts };
}
