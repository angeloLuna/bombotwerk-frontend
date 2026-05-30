'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/products';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already authenticated
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl });
    } catch (e: any) {
      setError('Ocurrió un error al intentar iniciar sesión con Google.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 relative overflow-hidden">
      {/* Visual Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-magenta/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="max-w-md w-full bg-[#111113] border border-white/5 p-8 rounded-2xl space-y-8 relative z-10 shadow-2xl">
        {/* Brand/Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-magenta rounded-2xl flex items-center justify-center mx-auto shadow-magenta-glow">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <h2 className="font-bebas text-4xl tracking-widest text-white mt-4 uppercase">
            BOMBO TWERK
          </h2>
          <p className="text-[10px] tracking-widest font-display text-neutral-500 font-bold uppercase">
            ATELIER // PANEL ADMINISTRATIVO
          </p>
        </div>

        {/* Info text */}
        <div className="space-y-4 text-center">
          <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed">
            Inicia sesión con tu cuenta corporativa de Google para gestionar el catálogo de productos, colecciones y órdenes del taller.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading || status === 'loading'}
            className="w-full shadow-magenta-glow py-3 flex items-center justify-center gap-3 font-display font-black tracking-widest text-xs"
          >
            {loading || status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                CONECTANDO...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.472 0-6.29-2.818-6.29-6.29 0-3.472 2.818-6.29 6.29-6.29 1.564 0 2.98.57 4.07 1.51l3.193-3.19C19.122 1.62 15.918 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.82-.073-1.618-.213-2.386H12.24z" />
                </svg>
                INICIAR SESIÓN CON GOOGLE
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/')}
            className="w-full text-[10px] tracking-widest font-display py-2.5"
          >
            ← VOLVER AL SITIO
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-[9px] text-neutral-600 font-mono tracking-wider">
            SESIÓN PROTEGIDA ENCRIPTADA • SOLO PERSONAL AUTORIZADO
          </p>
        </div>
      </div>
    </div>
  );
}
