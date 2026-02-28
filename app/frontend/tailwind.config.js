/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/providers/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: 'var(--card)',
                'card-inset': 'var(--card-inset)',
                border: 'var(--border)',
                'border-sharp': 'var(--border-sharp)',
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                success: 'var(--success)',
                error: 'var(--error)',
                warning: 'var(--warning)',
            },
            fontFamily: {
                heading: ['var(--font-fraunces)', 'Georgia', 'Times New Roman', 'serif'],
                body: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
                'inset-card': 'var(--card-inset-shadow)',
            },
            padding: {
                'safe': 'env(safe-area-inset-bottom)',
            },
        },
    },
    plugins: [],
}
