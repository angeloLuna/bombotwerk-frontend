import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationJsonLd, getWebPageJsonLd, getBreadcrumbListJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Envíos y Tiempos de Entrega | Bombo Twerk',
  description: 'Información oficial sobre nuestros métodos de envío, costos, entrega estimada de 2-5 días hábiles en stock y 7-9 días hábiles para productos bajo pedido.',
  alternates: {
    canonical: 'https://bombotwerk.com/envios-y-tiempos',
  },
  openGraph: {
    title: 'Envíos y Tiempos de Entrega | Bombo Twerk',
    description: 'Información oficial sobre nuestros métodos de envío, costos, entrega estimada de 2-5 días en stock y 7-9 días bajo pedido.',
    url: 'https://bombotwerk.com/envios-y-tiempos',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Envíos y Tiempos de Entrega | Bombo Twerk',
    description: 'Información oficial sobre nuestros métodos de envío, costos y tiempos de entrega.',
  },
};

export default function ShippingInfoPage() {
  const orgJsonLd = getOrganizationJsonLd();
  const pageJsonLd = getWebPageJsonLd(
    'Envíos y Tiempos de Entrega | Bombo Twerk',
    'Información oficial sobre nuestros métodos de envío, costos, entrega estimada de 2-5 días hábiles en stock y 7-9 días hábiles para productos bajo pedido.',
    'https://bombotwerk.com/envios-y-tiempos'
  );
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Envíos y Tiempos', item: 'https://bombotwerk.com/envios-y-tiempos' },
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
            Información
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-serif text-white uppercase tracking-wide">
            Envíos y{' '}
            <span className="italic font-normal text-brand-magenta text-glow-magenta">
              Tiempos
            </span>
          </h1>
          <p className="mt-4 text-xs text-neutral-400 tracking-widest uppercase font-sans">
            Métodos de entrega, tarifas y fabricación
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="space-y-10 text-neutral-300 font-sans text-sm md:text-base leading-relaxed tracking-wide">
          
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              1. Tiempos de Fabricación y Preparación
            </h2>
            <p>
              En Bombo Twerk operamos con dos esquemas de inventario para asegurar una confección detallada y sustentable en nuestro atelier de la Ciudad de México:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-white/10 rounded-xl bg-brand-charcoal/30 p-5 space-y-2">
                <span className="font-display font-black text-xs text-brand-magenta tracking-widest uppercase">Productos en Stock</span>
                <p className="font-serif text-lg text-white">Entrega estimada de 2 a 5 días hábiles</p>
                <p className="text-xs text-neutral-400">Las piezas disponibles de envío inmediato se procesan en un lapso de 24 horas hábiles tras la validación de tu pago.</p>
              </div>
              <div className="border border-white/10 rounded-xl bg-brand-charcoal/30 p-5 space-y-2">
                <span className="font-display font-black text-xs text-brand-magenta tracking-widest uppercase">Bajo Pedido (Made to Order)</span>
                <p className="font-serif text-lg text-white">Fabricación de 7 a 9 días hábiles + envío</p>
                <p className="text-xs text-neutral-400">Nuestros productos bajo pedido son elaborados manualmente para ti. El plazo de producción es de 7 a 9 días hábiles antes de ser entregados a la paquetería.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              2. Costos de Envío
            </h2>
            <p>
              Realizamos envíos seguros a toda la República Mexicana a través de las principales paqueterías autorizadas:
            </p>
            <ul className="space-y-3 ml-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Envío Estándar Nacional:</strong> $150 MXN de costo fijo para pedidos que no califiquen para envío gratis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Envío Gratis:</strong> Aplicable de forma automática en compras superiores a <strong>$1,000 MXN</strong>.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              3. Envíos Divididos (Carrito Mixto)
            </h2>
            <p>
              Si tu carrito de compra contiene una combinación de <strong>productos en stock</strong> y <strong>productos bajo pedido</strong>, se te presentará la opción de dividir tu pedido durante el checkout:
            </p>
            <ul className="space-y-2 ml-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Un Solo Envío:</strong> Agrupamos todo tu pedido y lo despachamos una vez que finalice la fabricación de las prendas bajo pedido.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                <span><strong>Envíos Separados:</strong> Enviamos de inmediato tus prendas en stock (entrega de 2 a 5 días) y, posteriormente, enviamos las prendas bajo pedido cuando terminen de ser fabricadas. Esta opción conlleva un costo de envío adicional por procesamiento doble.</span>
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
