import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()], 
    server: {
        port: 5173, 
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            },
            // ✅ FIX: WebSocket proxy với protocol đúng
            '/ws': {
                target: 'ws://localhost:3001', // ✅ ĐÚNG: ws:// protocol
                ws: true,
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('error', (err, req, res) => {
                    });
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                    });
                    proxy.on('open', (proxySocket) => {
                    });
                    proxy.on('close', (proxySocket) => {
                    });
                }
            }
        }
    }, 
    define: {
        'process.env.VITE_API_URL': JSON.stringify('http://localhost:5000')
    }
});
