'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Lock, ShieldCheck, KeyRound, AlertCircle, X } from 'lucide-react';

export default function ComingSoonPage() {
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Newsletter state
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Password gate state
  const [showGate, setShowGate] = useState(false);
  const [password, setPassword] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState(false);

  // Target launch date: June 15, 2026
  useEffect(() => {
    const launchDate = new Date('2026-06-15T00:00:00-06:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsletterSubscribed(true);
    setEmail('');
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setGateLoading(true);
    setGateError(null);

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reload to let middleware evaluate the new authorized cookie and redirect to home
        window.location.reload();
      } else {
        setGateError(data.error || 'Código incorrecto. Acceso denegado.');
      }
    } catch (err) {
      setGateError('Error de red. Intenta de nuevo.');
    } finally {
      setGateLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-brand-dark px-6 py-12 md:px-12 text-left font-sans text-neutral-300">

      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Neon Plum & Magenta glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-plum/25 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-violet/10 blur-[100px]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"
        />
      </div>

      {/* 1. HEADER (Eyebrow logo) */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-[10px] md:text-xs tracking-[0.25em] font-orbitron text-brand-magenta font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-magenta fill-brand-magenta/20 animate-pulse" />
          TEMPORADA 01 // ALMA DIGITAL
        </span>
        <span className="text-[9px] tracking-widest font-display text-neutral-500 uppercase border border-white/5 bg-white/5 px-2.5 py-1 rounded">
          CDMX ATELIER
        </span>
      </header>

      {/* 2. MAIN CONTENT (Teaser & Countdown) */}
      <main className="relative z-10 w-full max-w-4xl mx-auto my-auto py-12 space-y-12">
        {/* Brand Headline */}
        <div className="space-y-4">
          <h1 className="flex flex-col gap-1 md:gap-2 select-none">
            <span className="font-bebas text-5xl md:text-8xl tracking-wide text-white leading-none">
              BAILA CON
            </span>
            <span className="font-serif italic font-normal text-brand-magenta text-glow-magenta text-6xl md:text-9xl leading-[0.9] -mt-1 md:-mt-2">
              TU ALMA
            </span>
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-light max-w-md tracking-wider leading-relaxed">
            Premium performancewear diseñada en la Ciudad de México para esculpir, soportar y destacar bajo las luces de neón. El atelier está preparando los parámetros de confección.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl">
          {/* Days */}
          <div className="flex flex-col items-center bg-brand-charcoal border border-white/5 p-4 rounded-xl shadow-magenta-glow/5 relative overflow-hidden group hover:border-brand-magenta/30 transition-colors duration-300">
            <span className="font-orbitron font-black text-2xl md:text-4xl text-white">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[8px] md:text-[10px] tracking-widest text-neutral-500 font-display font-black uppercase mt-1">
              DÍAS
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center bg-brand-charcoal border border-white/5 p-4 rounded-xl shadow-magenta-glow/5 relative overflow-hidden group hover:border-brand-magenta/30 transition-colors duration-300">
            <span className="font-orbitron font-black text-2xl md:text-4xl text-white">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[8px] md:text-[10px] tracking-widest text-neutral-500 font-display font-black uppercase mt-1">
              HORAS
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center bg-brand-charcoal border border-white/5 p-4 rounded-xl shadow-magenta-glow/5 relative overflow-hidden group hover:border-brand-magenta/30 transition-colors duration-300">
            <span className="font-orbitron font-black text-2xl md:text-4xl text-white">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[8px] md:text-[10px] tracking-widest text-neutral-500 font-display font-black uppercase mt-1">
              MINS
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center bg-brand-charcoal border border-white/5 p-4 rounded-xl shadow-magenta-glow/5 relative overflow-hidden group hover:border-brand-magenta/30 transition-colors duration-300">
            <span className="font-orbitron font-black text-2xl md:text-4xl text-brand-magenta text-glow-magenta">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[8px] md:text-[10px] tracking-widest text-neutral-500 font-display font-black uppercase mt-1">
              SEGS
            </span>
          </div>
        </div>

        {/* Newsletter Signup (Join the darkness) */}
        <div className="max-w-md pt-4 space-y-3">
          <h3 className="text-[10px] tracking-widest font-display text-brand-gold font-black uppercase">
            ÚNETE A LA LISTA DE LANZAMIENTOS
          </h3>

          {newsletterSubscribed ? (
            <div className="p-4 border border-brand-magenta/25 bg-brand-magenta/5 text-xs text-white uppercase tracking-wider rounded-lg flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-magenta" />
              <span>¡Acceso registrado en el Guestlist con éxito!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="coming-soon-email"
                  type="email"
                  required
                  placeholder="TU CORREO ELECTRÓNICO"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-widest uppercase font-sans focus:shadow-magenta-glow/20"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-brand-magenta hover:bg-brand-magenta/80 text-black font-display font-black text-xs px-6 rounded-lg transition-colors tracking-widest shadow-magenta-glow uppercase"
              >
                UNIRSE
              </button>
            </form>
          )}
        </div>
      </main>

      {/* 3. FOOTER (Branding, Legal & Lock/Access Gate) */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 text-[10px] text-neutral-600 tracking-widest font-display uppercase">
        <span>© {new Date().getFullYear()} BOMBO TWERK. TODOS LOS DERECHOS RESERVADOS.</span>

        <div className="flex items-center gap-4">
          <span className="text-neutral-500">HECHO EN  CDMX</span>
          <button
            type="button"
            onClick={() => setShowGate(true)}
            className="p-1 text-neutral-600 hover:text-brand-magenta transition-colors cursor-pointer"
            aria-label="Atelier Developer Access"
            title="Atelier Access"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* 4. ATELIER ACCESS PASSWORD GATE OVERLAY MODAL */}
      {showGate && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-brand-charcoal border border-brand-magenta/30 p-8 rounded-2xl space-y-6 shadow-magenta-glow relative">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => { setShowGate(false); setPassword(''); setGateError(null); }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-brand-magenta/10 border border-brand-magenta/30 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 text-brand-magenta" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-serif text-2xl text-white uppercase tracking-wide">
                ACCESO <span className="text-brand-magenta italic text-glow-magenta">ATELIER</span>
              </h2>
              <p className="text-[10px] text-neutral-500 tracking-widest font-display">
                SISTEMA INTERNO — INGRESA CONTRASEÑA
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  placeholder="CONTRASEÑA DE ACCESO"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-lg py-3.5 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-widest text-center uppercase"
                  autoFocus
                />
              </div>

              {gateError && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gateError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowGate(false); setPassword(''); setGateError(null); }}
                  className="flex-1 bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 py-3 rounded-lg text-xs font-display font-black tracking-widest transition-colors uppercase"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={gateLoading}
                  className="flex-1 bg-brand-magenta hover:bg-brand-magenta/80 text-black py-3 rounded-lg text-xs font-display font-black tracking-widest transition-colors shadow-magenta-glow uppercase disabled:opacity-50"
                >
                  {gateLoading ? 'COMPROBANDO...' : 'ENTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
