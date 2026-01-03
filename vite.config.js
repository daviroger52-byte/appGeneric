import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta o limite do aviso para 1000kb (1mb) para evitar alertas falsos
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // Esta função ajuda a dividir os arquivos (Code Splitting)
        manualChunks(id) {
          // Se o arquivo vier da pasta node_modules (bibliotecas)
          if (id.includes('node_modules')) {
            // Coloca tudo o que é Firebase num arquivo separado
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Coloca gráficos e ícones noutro arquivo
            if (id.includes('lucide') || id.includes('recharts')) {
              return 'ui-libs';
            }
            // O resto das bibliotecas (React, etc) vai para 'vendor'
            return 'vendor';
          }
        },
      },
    },
  },
})