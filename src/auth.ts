import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';

// Helper to sign JWT using Web Crypto API (Edge Runtime compatible)
async function signJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Base64URL encode helper
  const base64UrlEncode = (input: string | Uint8Array): string => {
    let binary = '';
    if (typeof input === 'string') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input);
      bytes.forEach((b) => binary += String.fromCharCode(b));
    } else {
      input.forEach((b) => binary += String.fromCharCode(b));
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // 1. Prepare Header and Payload
  const headerStr = JSON.stringify(header);
  const payloadStr = JSON.stringify(payload);
  const encodedHeader = base64UrlEncode(headerStr);
  const encodedPayload = base64UrlEncode(payloadStr);
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  // 2. Sign using Web Crypto API
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(secret);
  const dataToSignData = encoder.encode(dataToSign);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    dataToSignData
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${dataToSign}.${encodedSignature}`;
}

// Build providers list dynamically
const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

// Facebook Login: only register if explicitly enabled and credentials exist
if (
  process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true' &&
  process.env.FACEBOOK_CLIENT_ID &&
  process.env.FACEBOOK_CLIENT_SECRET
) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = isAdminEmail(user.email) ? 'admin' : (user as any).role || 'customer';
      }

      // If logging in, sync the user's profile with the backend
      if (account && user) {
        try {
          const backendUrl =
            process.env.BACKEND_INTERNAL_URL ||
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            'http://localhost:4000';
            
          const response = await fetch(`${backendUrl}/api/auth/google-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
            }),
          });

          if (response.ok) {
            const dbUser = await response.json();
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('[NextAuth Callback] Error syncing with backend auth:', error);
        }
      }

      // Sign custom JWT for backend authorization checks
      if (token.email) {
        const backendSecret =
          process.env.BACKEND_JWT_SECRET || 'fallback-secret-for-jwt-signing-12345';
        
        const payload = {
          userId: token.id,
          email: token.email,
          role: token.role || 'customer',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        };

        const backendJwt = await signJWT(payload, backendSecret);
        token.backendToken = backendJwt;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.backendToken = token.backendToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
