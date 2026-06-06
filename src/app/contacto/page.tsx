import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationJsonLd, getWebPageJsonLd, getBreadcrumbListJsonLd } from '@/lib/seo';
import { MessageSquare, Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contacto | Bombo Twerk',
  description: 'Ponte en contacto con el equipo de soporte y atelier de Bombo Twerk. Escríbenos por WhatsApp o correo electrónico para dudas de tallas o pedidos.',
  alternates: {
    canonical: 'https://bombotwerk.com/contacto',
  },
  openGraph: {
    title: 'Contacto | Bombo Twerk',
    description: 'Ponte en contacto con el equipo de soporte y atelier de Bombo Twerk. WhatsApp oficial y atención personalizada.',
    url: 'https://bombotwerk.com/contacto',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contacto | Bombo Twerk',
    description: 'Ponte en contacto con el equipo de soporte y atelier de Bombo Twerk.',
  },
};

export default function ContactPage() {
  const orgJsonLd = getOrganizationJsonLd();
  const pageJsonLd = getWebPageJsonLd(
    'Contacto | Bombo Twerk',
    'Ponte en contacto con el equipo de soporte y atelier de Bombo Twerk. Escríbenos por WhatsApp o correo electrónico para dudas de tallas o pedidos.',
    'https://bombotwerk.com/contacto'
  );
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Contacto', item: 'https://bombotwerk.com/contacto' },
  ]);

  return (
    <div className="min-h-screen bg-brand-dark text-left">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero header */}
      <div className="relative pt-32 pb-16 px-6 text-center bg-gradient-to-b from-brand-plum via-brand-dark to-brand-dark border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-magenta/5 via-transparent to-brand-magenta/5 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] font-orbitron text-brand-magenta font-bold uppercase">
            Soporte
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-serif text-white uppercase tracking-wide">
            Contacto{' '}
            <span className="italic font-normal text-brand-magenta text-glow-magenta">
              Atelier
            </span>
          </h1>
          <p className="mt-4 text-xs text-neutral-400 tracking-widest uppercase font-sans">
            Escríbenos y resuelve tus dudas
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Info card */}
          <div className="space-y-6 text-neutral-300 font-sans text-sm md:text-base leading-relaxed tracking-wide">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10 text-left">
              Canales de Atención
            </h2>
            <p>
              ¿Tienes preguntas sobre tu talla ideal, materiales o el estatus de tu pedido? Nuestro equipo en el atelier de Ciudad de México está listo para asesorarte.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-brand-magenta mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">Ubicación</h4>
                  <p className="text-xs text-neutral-400">Atelier Privado, Confección a Mano — Ciudad de México, México.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-brand-magenta mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">Horario</h4>
                  <p className="text-xs text-neutral-400">Lunes a Viernes: 10:00 AM - 6:00 PM CST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact buttons */}
          <div className="flex flex-col justify-center space-y-4">
            <a
              href="https://wa.me/5215582470356?text=Hola!%20Me%20gustar%C3%ADa%20hacer%20una%20consulta%20sobre%20mi%20talla%20o%20pedido%20en%20Bombo%20Twerk."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-brand-magenta hover:bg-[#ff00bb] text-black font-display font-black tracking-widest text-xs uppercase py-4 rounded-xl shadow-magenta-glow transition-all duration-300 w-full"
            >
              <MessageSquare className="w-5 h-5 text-black" />
              <span>Chatear por WhatsApp</span>
            </a>

            <a
              href="mailto:soporte@bombotwerk.com"
              className="flex items-center justify-center gap-3 border border-white/10 bg-[#161616] hover:border-white/30 text-white font-display font-bold tracking-widest text-xs uppercase py-4 rounded-xl transition-all duration-300 w-full"
            >
              <Mail className="w-5 h-5 text-neutral-400" />
              <span>Enviar Correo</span>
            </a>
          </div>
        </div>

        <div className="pt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-display font-bold tracking-widest text-neutral-400 hover:text-brand-magenta transition-colors border-b border-white/10 hover:border-brand-magenta pb-1"
          >
            VOLVER AL INICIO
          </Link>
        </div>
      </article>
    </div>
  );
}
