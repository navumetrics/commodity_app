import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// Replace 'commodity_app' with your exact repo name if different
const REPO_NAME = 'commodity_app';

export default defineConfig({
  // Set the base path for GitHub Pages deployment
  base: `/${REPO_NAME}/`, 

  plugins: [react()],

  // Explicitly define CSS processing to fix the Tailwind error
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})