'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 relative overflow-hidden">
      {/* Visual Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="max-w-md w-full bg-[#111113] border border-white/5 p-8 rounded-2xl space-y-8 relative z-10 shadow-2xl">
        {/* Warning Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-red-glow">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="font-bebas text-4xl tracking-widest text-red-500 mt-4 uppercase">
            ACCESO RESTRINGIDO
          </h2>
          <p className="text-[10px] tracking-widest font-display text-neutral-500 font-bold uppercase">
            ROLE REQUERIDO: ADMINISTRADOR
          </p>
        </div>

        {/* Info text */}
        <div className="space-y-4 text-center text-xs">
          <p className="text-neutral-400 font-sans font-light leading-relaxed">
            Tu cuenta actual <strong className="text-white font-mono font-normal">({session?.user?.email})</strong> no cuenta con privilegios administrativos para acceder a esta sección.
          </p>
          <p className="text-neutral-500 font-sans font-light leading-relaxed">
            Si crees que esto es un error, por favor contacta al equipo técnico o a un administrador del taller.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleLogout}
            className="w-full py-2.5 flex items-center justify-center gap-2 font-display font-black tracking-widest text-xs"
          >
            <LogOut className="w-4 h-4" /> CERRAR SESIÓN / OTRO USUARIO
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/')}
            className="w-full text-[10px] tracking-widest font-display py-2.5 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER AL SITIO
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-[9px] text-neutral-600 font-mono tracking-wider">
            SESIÓN ACTIVA CON ROL: {session?.user?.role || 'customer'}
          </p>
        </div>
      </div>
    </div>
  );
}
