import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import jwt from 'jsonwebtoken';

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
        token.role = (user as any).role || 'customer';
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
        
        const backendJwt = jwt.sign(
          {
            userId: token.id,
            email: token.email,
            role: token.role || 'customer',
          },
          backendSecret,
          { expiresIn: '30d' }
        );
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
