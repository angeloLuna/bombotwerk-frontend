import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationJsonLd, getWebPageJsonLd, getBreadcrumbListJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Guía de Tallas | Bombo Twerk',
  description: 'Consulta nuestra guía de tallas oficial para cacheteros, conjuntos, bodysuits y ropa de pole dance en Bombo Twerk. Encuentra tu ajuste perfecto.',
  alternates: {
    canonical: 'https://bombotwerk.com/guia-de-tallas',
  },
  openGraph: {
    title: 'Guía de Tallas | Bombo Twerk',
    description: 'Consulta nuestra guía de tallas oficial para cacheteros, conjuntos, bodysuits y ropa de pole dance en Bombo Twerk.',
    url: 'https://bombotwerk.com/guia-de-tallas',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Guía de Tallas | Bombo Twerk',
    description: 'Consulta nuestra guía de tallas oficial para cacheteros, conjuntos, bodysuits y ropa de pole dance.',
  },
};

export default function SizeGuidePage() {
  const orgJsonLd = getOrganizationJsonLd();
  const pageJsonLd = getWebPageJsonLd(
    'Guía de Tallas | Bombo Twerk',
    'Consulta nuestra guía de tallas oficial para cacheteros, conjuntos, bodysuits y ropa de pole dance en Bombo Twerk.',
    'https://bombotwerk.com/guia-de-tallas'
  );
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Guía de Tallas', item: 'https://bombotwerk.com/guia-de-tallas' },
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
            Ayuda
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-serif text-white uppercase tracking-wide">
            Guía de{' '}
            <span className="italic font-normal text-brand-magenta text-glow-magenta">
              Tallas
            </span>
          </h1>
          <p className="mt-4 text-xs text-neutral-400 tracking-widest uppercase font-sans">
            Encuentra tu ajuste perfecto
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="space-y-10 text-neutral-300 font-sans text-sm md:text-base leading-relaxed tracking-wide">
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              ¿Cómo medir tu cuerpo?
            </h2>
            <p>
              Para obtener la medida más precisa, te sugerimos utilizar una cinta métrica flexible y medir directamente sobre tu piel o ropa interior delgada.
            </p>
            <ul className="space-y-3 ml-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Busto:</strong> Mide horizontalmente alrededor de la parte más prominente de tu busto, manteniendo la cinta paralela al suelo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Cintura:</strong> Mide alrededor de la parte más estrecha de tu torso (generalmente justo arriba del ombligo).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Cadera:</strong> Mide horizontalmente alrededor de la parte más ancha de tu cadera/glúteos.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              Tabla de Medidas Generales (Centímetros)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-brand-charcoal/30">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-[10px] tracking-widest text-neutral-400 font-display font-bold">
                    <th className="px-6 py-4">TALLA</th>
                    <th className="px-6 py-4">BUSTO</th>
                    <th className="px-6 py-4">CINTURA</th>
                    <th className="px-6 py-4">CADERA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">XS (Extra Chica)</td>
                    <td className="px-6 py-4">78 - 83 cm</td>
                    <td className="px-6 py-4">58 - 63 cm</td>
                    <td className="px-6 py-4">84 - 89 cm</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">S (Chica)</td>
                    <td className="px-6 py-4">84 - 89 cm</td>
                    <td className="px-6 py-4">64 - 69 cm</td>
                    <td className="px-6 py-4">90 - 95 cm</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">M (Mediana)</td>
                    <td className="px-6 py-4">90 - 95 cm</td>
                    <td className="px-6 py-4">70 - 75 cm</td>
                    <td className="px-6 py-4">96 - 101 cm</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">L (Grande)</td>
                    <td className="px-6 py-4">96 - 101 cm</td>
                    <td className="px-6 py-4">76 - 81 cm</td>
                    <td className="px-6 py-4">102 - 107 cm</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">XL (Extra Grande)</td>
                    <td className="px-6 py-4">102 - 107 cm</td>
                    <td className="px-6 py-4">82 - 87 cm</td>
                    <td className="px-6 py-4">108 - 113 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              Consejo de Ajuste de Atelier
            </h2>
            <p>
              Nuestras piezas están confeccionadas con telas elásticas de alta resistencia para brindar soporte estructural durante el baile, twerk y floorwork. 
            </p>
            <p>
              Si tus medidas se encuentran entre dos tallas:
            </p>
            <ul className="space-y-2 ml-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span>Elige la <strong>talla menor</strong> si prefieres un ajuste de alta compresión y máximo soporte.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span>Elige la <strong>talla mayor</strong> si prefieres una sensación más cómoda y un calce más relajado.</span>
              </li>
            </ul>
          </section>

          <div className="pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-display font-bold tracking-widest text-neutral-400 hover:text-brand-magenta transition-colors border-b border-white/10 hover:border-brand-magenta pb-1"
            >
              VOLVER AL INICIO
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
