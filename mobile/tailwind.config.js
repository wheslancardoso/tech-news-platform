/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#ffffff",
                foreground: "#0f172a",
                card: {
                    DEFAULT: "#ffffff",
                    foreground: "#0f172a",
                },
                primary: {
                    DEFAULT: "#0f172a",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#f1f5f9",
                    foreground: "#0f172a",
                },
                muted: {
                    DEFAULT: "#f1f5f9",
                    foreground: "#64748b",
                },
                accent: {
                    DEFAULT: "#f1f5f9",
                    foreground: "#0f172a",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#ffffff",
                },
                border: "#e2e8f0",
                input: "#e2e8f0",
                ring: "#0f172a",
            },
            borderRadius: {
                lg: 12,
                md: 10,
                sm: 8,
            },
        },
    },
    plugins: [],
};
