/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
  // Enable source maps
  map: { 
    inline: true // Set to true for inline source maps, false for separate .map files
  }
};

export default config;