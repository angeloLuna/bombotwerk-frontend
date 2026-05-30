import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'bombo-atelier-secret-key-321',
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),

  ],
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
