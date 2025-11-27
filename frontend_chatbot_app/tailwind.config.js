/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#F59E0B",
        error: "#EF4444",
        background: "#f9fafb",
        surface: "#ffffff",
        textcolor: "#111827"
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 10px 15px -3px rgba(37, 99, 235, 0.08), 0 4px 6px -2px rgba(17,24,39,0.05)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem'
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(249,250,251,1) 100%)',
        'ocean-accent': 'linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(59,130,246,1) 100%)'
      }
    }
  },
  plugins: []
};
