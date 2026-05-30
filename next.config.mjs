/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost',
    '192.168.1.75',
    '192.168.1.75:3000',
    '192.168.1.75:3001',
    '*.ngrok-free.app',
    '*.ngrok-free.dev',
    'reiko-overoffensive-unpessimistically.ngrok-free.dev',
    '*.ngrok.io',
  ],

};

export default nextConfig;
