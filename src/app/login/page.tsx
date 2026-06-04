'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';
  
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminFlow = callbackUrl.includes('admin');

  useEffect(() => {
    // Redirect if already authenticated
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl });
    } catch (e: any) {
      setError('Ocurrió un error al intentar iniciar sesión con Google.');
      setLoadingGoogle(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoadingFacebook(true);
    setError(null);
    try {
      await signIn('facebook', { callbackUrl });
    } catch (e: any) {
      setError('Ocurrió un error al intentar iniciar sesión con Facebook.');
      setLoadingFacebook(false);
    }
  };

  const isAnyLoading = loadingGoogle || loadingFacebook || status === 'loading';

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 relative overflow-hidden">
      {/* Visual Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-magenta/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="max-w-md w-full bg-[#0d0d0e] border border-white/5 p-8 rounded-2xl space-y-8 relative z-10 shadow-[0_0_50px_0_rgba(219,39,119,0.05)] backdrop-blur-xl">
        {/* Brand/Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-magenta rounded-2xl flex items-center justify-center mx-auto shadow-magenta-glow">
            <Zap className="w-6 h-6 text-black fill-current" />
          </div>
          <h2 className="font-bebas text-4xl tracking-widest text-white mt-4 uppercase">
            BOMBO TWERK
          </h2>
          <p className="text-[10px] tracking-widest font-display text-neutral-500 font-bold uppercase">
            {isAdminFlow ? 'ATELIER // PANEL ADMINISTRATIVO' : 'CONÉCTATE AL MOVIMIENTO'}
          </p>
        </div>

        {/* Info text */}
        <div className="space-y-4 text-center">
          <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed">
            {isAdminFlow 
              ? `Inicia sesión con tu cuenta corporativa de Google${process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true' ? ' o Facebook' : ''} para gestionar el catálogo de productos, colecciones y órdenes del taller.`
              : 'Únete para guardar tu arsenal de prendas, consultar tu historial de pedidos, autocompletar tus datos de envío y recibir seguimiento de tu compra.'}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isAnyLoading}
            className="w-full shadow-magenta-glow py-3 flex items-center justify-center gap-3 font-display font-black tracking-widest text-xs uppercase"
          >
            {loadingGoogle ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                CONECTANDO...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.472 0-6.29-2.818-6.29-6.29 0-3.472 2.818-6.29 6.29-6.29 1.564 0 2.98.57 4.07 1.51l3.193-3.19C19.122 1.62 15.918 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.82-.073-1.618-.213-2.386H12.24z" />
                </svg>
                CONTINUAR CON GOOGLE
              </>
            )}
          </Button>

          {process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true' && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleFacebookLogin}
              disabled={isAnyLoading}
              className="w-full py-3 flex items-center justify-center gap-3 font-display font-black tracking-widest text-xs uppercase border-white/10 hover:border-brand-magenta/40 hover:bg-brand-magenta/5 text-white"
            >
              {loadingFacebook ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  CONECTANDO...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current text-neutral-300" viewBox="0 0 24 24">
                    <path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6c0-.53.47-1 1-1h1.72V1h-2.88a3.5 3.5 0 0 0-3.84 3.5V8z" />
                  </svg>
                  CONTINUAR CON FACEBOOK
                </>
              )}
            </Button>
          )}

          <div className="pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push(isAdminFlow ? '/' : '/')}
              className="w-full text-[10px] tracking-widest font-display py-2.5 border-transparent text-neutral-500 hover:text-white"
            >
              ← VOLVER AL SITIO
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-[9px] text-neutral-600 font-mono tracking-wider">
            CONEXIÓN SEGURA ENCRIPTADA • BOMBO TWERK EST. 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-magenta" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
