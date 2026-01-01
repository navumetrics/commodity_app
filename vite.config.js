import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

const REPO_NAME = 'commodity_app';

export default defineConfig({

  base: `/${REPO_NAME}/`, 

  plugins: [react()],

  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})