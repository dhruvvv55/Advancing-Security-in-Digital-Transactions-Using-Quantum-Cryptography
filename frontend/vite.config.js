import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/otp': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false, // use this if your backend doesn't have a valid SSL certificate
      },
      '/quantum': {
        target: 'https://qrng.anu.edu.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/quantum/, ''),
      },
    },
  },
});
