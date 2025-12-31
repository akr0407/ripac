import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
    content: [
        './app/components/**/*.{js,vue,ts}',
        './app/layouts/**/*.vue',
        './app/pages/**/*.vue',
        './app/plugins/**/*.{js,ts}',
        './app/app.vue',
        './app/error.vue',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                // "Medical Plus" Palette extension if needed, but using DaisyUI themes primarily
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
        },
    },
    plugins: [daisyui],
    daisyui: {
        themes: [
            {
                light: {
                    ...require('daisyui/src/theming/themes')['winter'],
                    primary: '#0F766E', // Teal-700
                    'primary-content': '#ffffff',
                    secondary: '#0369A1', // Sky-700
                    accent: '#F59E0B', // Amber-500
                    neutral: '#333c4d',
                    'base-100': '#ffffff',
                    'base-200': '#F3F4F6',
                    info: '#3ABFF8',
                    success: '#36D399',
                    warning: '#FBBD23',
                    error: '#F87272',
                },
                dark: {
                    ...require('daisyui/src/theming/themes')['night'],
                    primary: '#2DD4BF', // Teal-400
                    secondary: '#38BDF8', // Sky-400
                    'base-100': '#0F172A', // Slate-900 (Deep Blue)
                    'base-200': '#1E293B', // Slate-800
                }
            },
            'winter', 'night'
        ],
        darkTheme: 'dark',
        base: true,
        styled: true,
        utils: true,
        logs: false,
    },
} satisfies Config;
