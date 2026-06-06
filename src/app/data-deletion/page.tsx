import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationJsonLd, getWebPageJsonLd, getBreadcrumbListJsonLd } from '@/lib/seo';

const title = 'Eliminación de Datos | Bombo Twerk';
const description = 'Instrucciones paso a paso para solicitar la eliminación de datos de usuario y la desvinculación de cuentas en la tienda Bombo Twerk.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://bombotwerk.com/data-deletion',
  },
  openGraph: {
    title,
    description,
    url: 'https://bombotwerk.com/data-deletion',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function DataDeletionPage() {
  const orgJsonLd = getOrganizationJsonLd();
  const pageJsonLd = getWebPageJsonLd(title, description, 'https://bombotwerk.com/data-deletion');
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Eliminación de Datos', item: 'https://bombotwerk.com/data-deletion' },
  ]);

  return (
    <div className="min-h-screen bg-brand-dark">
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
            Privacidad
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-serif text-white uppercase tracking-wide">
            Eliminación de{' '}
            <span className="italic font-normal text-brand-magenta text-glow-magenta">
              Datos
            </span>
          </h1>
          <p className="mt-4 text-xs md:text-sm text-neutral-400 tracking-wide font-sans max-w-lg mx-auto leading-relaxed">
            En Bombo Twerk respetamos tu privacidad. Si iniciaste sesión en nuestra tienda usando
            Facebook y deseas eliminar los datos asociados a tu cuenta, puedes solicitarlo en
            cualquier momento.
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="space-y-10 text-neutral-300 font-sans text-sm md:text-base leading-relaxed tracking-wide">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              ¿Qué datos podemos almacenar?
            </h2>
            <p>
              Podemos almacenar información básica necesaria para crear tu cuenta o procesar tus
              compras, como tu nombre, correo electrónico e identificador de inicio de sesión
              proporcionado por Facebook.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              Cómo solicitar la eliminación
            </h2>
            <p className="mb-4">
              Para solicitar la eliminación de tus datos, envíanos un correo a:
            </p>
            <p className="mb-5">
              <a
                href="mailto:bombotextil@gmail.com?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20datos"
                className="text-brand-magenta hover:underline font-medium text-base md:text-lg"
              >
                bombotextil@gmail.com
              </a>
            </p>
            <div className="p-5 rounded-xl border border-white/10 bg-brand-charcoal/40 space-y-3">
              <p>
                <strong className="text-white">Asunto:</strong>{' '}
                Solicitud de eliminación de datos
              </p>
              <p>
                <strong className="text-white">En el mensaje incluye:</strong>{' '}
                El correo electrónico asociado a tu cuenta.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              Tiempo de respuesta
            </h2>
            <p>
              Revisaremos tu solicitud y eliminaremos los datos asociados a tu cuenta en un plazo
              razonable, salvo aquellos datos que debamos conservar por obligaciones legales,
              fiscales, antifraude o de cumplimiento.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              También puedes eliminar el acceso desde Facebook
            </h2>
            <p className="mb-4">
              Puedes ir a tu cuenta de Facebook, entrar a{' '}
              <strong className="text-white">Configuración y privacidad</strong>, luego a{' '}
              <strong className="text-white">Apps y sitios web</strong>, buscar{' '}
              <strong className="text-white">Bombo Twerk</strong> y eliminar el acceso de la
              aplicación.
            </p>
          </section>
        </div>

        {/* Navigation links */}
        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs tracking-widest font-display font-black uppercase">
          <Link
            href="/privacy"
            className="text-neutral-400 hover:text-brand-magenta transition-colors"
          >
            Aviso de Privacidad
          </Link>
          <Link
            href="/"
            className="text-neutral-400 hover:text-brand-magenta transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </article>
    </div>
  );
}
