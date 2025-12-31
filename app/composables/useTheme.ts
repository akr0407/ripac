export function useTheme() {
    const theme = useState<string>('theme', () => 'light');

    // Load from localStorage on client
    if (import.meta.client) {
        const stored = localStorage.getItem('theme');
        if (stored) {
            theme.value = stored;
        }
    }

    function setTheme(newTheme: string) {
        theme.value = newTheme;
        if (import.meta.client) {
            localStorage.setItem('theme', newTheme);
        }
    }

    function toggleDark() {
        setTheme(theme.value === 'dark' ? 'light' : 'dark');
    }

    const isDark = computed(() => theme.value === 'dark');

    return {
        theme,
        isDark,
        setTheme,
        toggleDark,
    };
}
