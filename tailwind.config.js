/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: "jit",
    content: ["./index.html", "./src/**/*.{html,js,ts}"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/forms")],
};
