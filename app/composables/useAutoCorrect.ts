import nspell from 'nspell';
// dictionary-en-us uses fs which breaks in browser
// importing directly to avoid build errors

export function useAutoCorrect() {
    const speller = ref<any>(null);
    const isReady = ref(false);

    // Initialize dictionary on mount
    onMounted(async () => {
        try {
            const [aff, dic] = await Promise.all([
                fetch('/dictionaries/en_US.aff').then(res => res.text()),
                fetch('/dictionaries/en_US.dic').then(res => res.text())
            ]);

            speller.value = nspell({ aff, dic });
            isReady.value = true;
        } catch (err) {
            console.error('Failed to load dictionary from CDN', err);
        }
    });

    const checkSpelling = (text: string): { segments: { text: string, isTypo: boolean, suggestions?: string[] }[], typoCount: number } => {
        if (!speller.value || !text) return { segments: [{ text: text || '', isTypo: false }], typoCount: 0 };

        let typoCount = 0;
        const words = text.split(/([a-zA-Z]+)/);

        const segments = words.map((segment) => {
            // If segment is a word (contains letters)
            if (/^[a-zA-Z]+$/.test(segment)) {
                if (!speller.value.correct(segment)) {
                    typoCount++;
                    return {
                        text: segment,
                        isTypo: true,
                        suggestions: speller.value.suggest(segment)
                    };
                }
            }
            return { text: segment, isTypo: false };
        });

        return { segments, typoCount };
    };

    const correctText = (text: string): { corrected: string; count: number } => {
        const { segments, typoCount } = checkSpelling(text);
        const corrected = segments.map(s => s.isTypo && s.suggestions?.length ? s.suggestions[0] : s.text).join('');
        return { corrected, count: typoCount };
    };

    return {
        correctText,
        checkSpelling,
        isReady
    };
}
