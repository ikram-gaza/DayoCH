import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Tailwind v4 n a plus de fichier tailwind.config.js ni de postcss.config.js :
  // il s installe comme un plugin Vite, et le theme se declare en CSS.
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },

  server: {
    port: 5173,
    // Le navigateur appelle /api, Vite relaie vers le backend : pas de CORS a
    // regler en developpement, et aucune URL de serveur ecrite dans le code.
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },

  build: {
    // Decoupage explicite : les grosses dependances changent rarement, elles
    // restent donc en cache navigateur quand notre code evolue.
    //
    // Vite 8 attend ici une FONCTION et non plus une table : elle recoit le
    // chemin du module et renvoie le nom du paquet ou le ranger, ou rien pour
    // laisser l outil decider.
    rollupOptions: {
      output: {
        manualChunks(identifiant) {
          if (identifiant.includes('node_modules/@xyflow')) return 'flow-vendor';
          if (/node_modules\/(react|react-dom|react-router)/.test(identifiant)) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
