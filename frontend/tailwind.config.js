/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    safelist: ["sparkle"],
    theme: {
        extend: {
            animation: {
                twinkle: "twinkle 3.5s ease-in-out infinite",
            },
            keyframes: {
                twinkle: {
                    "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
                    "50%": { opacity: "1", transform: "scale(1.3)" },
                },
            },
            clipPath: {
                trapezoid: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
            },
        },
    },
    plugins: [],
};
