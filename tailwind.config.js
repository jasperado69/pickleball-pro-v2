/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    body: '#0f172a',
                    card: '#1e293b',
                    'card-hover': '#334155',
                },
                primary: {
                    DEFAULT: '#06b6d4', // Cyan 500
                    glow: 'rgba(6, 182, 212, 0.5)',
                },
                text: {
                    main: '#f8fafc',
                    muted: '#94a3b8',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
