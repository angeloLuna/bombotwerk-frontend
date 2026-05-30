import { handlers } from '@/auth';
export const { GET, POST } = handlers;
export const runtime = 'nodejs'; // Use nodejs runtime to support jsonwebtoken cryptographic operations
