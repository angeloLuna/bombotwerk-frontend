import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad | Bombo Twerk',
  description: 'Aviso de Privacidad de Bombo Twerk.',
  alternates: {
    canonical: 'https://bombotwerk.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero header */}
      <div className="relative pt-32 pb-16 px-6 text-center bg-gradient-to-b from-brand-plum via-brand-dark to-brand-dark border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-magenta/5 via-transparent to-brand-magenta/5 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] font-orbitron text-brand-magenta font-bold uppercase">
            Legal
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-serif text-white uppercase tracking-wide">
            Aviso de{' '}
            <span className="italic font-normal text-brand-magenta text-glow-magenta">
              Privacidad
            </span>
          </h1>
          <p className="mt-4 text-xs text-neutral-400 tracking-widest uppercase font-sans">
            Última actualización: 4 de junio de 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="privacy-content space-y-10 text-neutral-300 font-sans text-sm md:text-base leading-relaxed tracking-wide">

          {/* Intro */}
          <p>
            Bombo Twerk, en adelante &quot;Bombo Twerk&quot;, con sitio web en{' '}
            <strong className="text-white">https://bombotwerk.com</strong>, es responsable del uso,
            tratamiento y protección de los datos personales que recabamos a través de nuestro sitio
            web, tienda en línea, formularios, medios de contacto, redes sociales y canales
            relacionados con la compra de nuestros productos.
          </p>
          <p>
            Este Aviso de Privacidad se emite de conformidad con la Ley Federal de Protección de
            Datos Personales en Posesión de los Particulares y demás normativa aplicable en México.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              1. Datos personales que recabamos
            </h2>
            <p className="mb-4">Podemos recabar los siguientes datos personales:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Nombre completo.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Correo electrónico.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Número telefónico.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Dirección de envío y facturación.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Información relacionada con pedidos, compras, productos seleccionados, tallas, preferencias de entrega y seguimiento de compra.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Información de pago necesaria para procesar transacciones mediante proveedores externos de pago.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Datos de autenticación cuando el usuario inicia sesión mediante servicios de terceros, como Google o Facebook, tales como nombre, correo electrónico e identificador de cuenta proporcionado por dichos servicios.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Información técnica básica, como dirección IP, tipo de navegador, dispositivo, sistema operativo, cookies y datos de navegación dentro del sitio.
              </li>
            </ul>
            <p className="mt-5">
              Bombo Twerk no solicita de forma intencional datos personales sensibles. En caso de que
              el usuario proporcione voluntariamente información adicional a través de mensajes,
              formularios o notas de pedido, dicha información será utilizada únicamente para atender
              la solicitud correspondiente.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              2. Finalidades del tratamiento
            </h2>
            <p className="mb-4">Utilizamos los datos personales para las siguientes finalidades necesarias:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Crear y administrar cuentas de usuario.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Procesar pedidos, pagos, envíos, devoluciones, cambios y solicitudes relacionadas con compras.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Confirmar identidad y autenticación mediante Google, Facebook u otros proveedores autorizados.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Enviar confirmaciones de compra, actualizaciones de pedido, comprobantes, información de envío y atención postventa.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Brindar soporte al cliente y responder solicitudes enviadas por el usuario.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Gestionar inventario, disponibilidad de productos, productos bajo pedido y tiempos estimados de fabricación o entrega.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Prevenir fraudes, abusos, accesos no autorizados o actividades contrarias a nuestros términos y condiciones.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Cumplir obligaciones legales, fiscales, administrativas y de seguridad aplicables.
              </li>
            </ul>
            <p className="mt-5">
              También podremos utilizar los datos personales para finalidades secundarias, que no son
              indispensables para la relación comercial, como:
            </p>
            <ul className="space-y-2 ml-1 mt-4">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-violet shrink-0" />
                Enviar promociones, novedades, lanzamientos, campañas, descuentos o comunicaciones de marketing.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-violet shrink-0" />
                Realizar análisis estadísticos, mejora de experiencia de usuario, optimización del sitio web y medición de campañas.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-violet shrink-0" />
                Personalizar contenido, recomendaciones o comunicaciones relacionadas con productos de Bombo Twerk.
              </li>
            </ul>
            <p className="mt-5">
              El usuario puede oponerse al uso de sus datos para finalidades secundarias enviando una
              solicitud al correo indicado en este aviso.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              3. Pagos y proveedores externos
            </h2>
            <p>
              Los pagos realizados en nuestro sitio pueden ser procesados mediante proveedores
              externos, como Mercado Pago u otros servicios de pago autorizados. Bombo Twerk no
              almacena directamente datos completos de tarjetas bancarias. La información de pago es
              tratada por el proveedor correspondiente conforme a sus propios términos, políticas de
              privacidad y estándares de seguridad.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              4. Inicio de sesión con Google y Facebook
            </h2>
            <p className="mb-4">
              Cuando el usuario inicia sesión mediante Google o Facebook, dichos proveedores pueden
              compartir con Bombo Twerk información básica de perfil necesaria para autenticar la
              cuenta, como nombre, correo electrónico e identificador de usuario.
            </p>
            <p className="mb-4">
              Bombo Twerk utiliza esta información únicamente para permitir el acceso a la cuenta,
              identificar al usuario, consultar historial de pedidos, mejorar el proceso de compra y
              proteger la seguridad de la cuenta.
            </p>
            <p>
              El uso de Google, Facebook u otros servicios de terceros también está sujeto a las
              políticas de privacidad y condiciones de dichos proveedores.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              5. Transferencias de datos
            </h2>
            <p className="mb-4">
              Bombo Twerk podrá compartir datos personales con terceros únicamente cuando sea
              necesario para cumplir las finalidades descritas en este aviso, incluyendo:
            </p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Proveedores de pago.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Servicios de paquetería y logística.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Proveedores de almacenamiento, hosting, infraestructura, correo electrónico y herramientas tecnológicas.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Autoridades competentes, cuando exista obligación legal o requerimiento válido.
              </li>
            </ul>
            <p className="mt-5 font-medium text-white">
              Bombo Twerk no vende datos personales a terceros.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              6. Cookies y tecnologías similares
            </h2>
            <p className="mb-4">Nuestro sitio puede utilizar cookies y tecnologías similares para:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Mantener sesiones de usuario.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Recordar preferencias.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Operar el carrito de compra.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Analizar tráfico y comportamiento del sitio.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Mejorar la experiencia de navegación.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Medir campañas o rendimiento de contenido.
              </li>
            </ul>
            <p className="mt-5">
              El usuario puede configurar su navegador para bloquear o eliminar cookies. Sin embargo,
              algunas funciones del sitio podrían no operar correctamente si las cookies son
              deshabilitadas.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              7. Conservación de datos
            </h2>
            <p className="mb-4">
              Conservaremos los datos personales durante el tiempo necesario para cumplir las
              finalidades descritas en este aviso, atender obligaciones legales, fiscales o
              administrativas, resolver disputas, prevenir fraudes y mantener registros relacionados
              con compras, pedidos o atención al cliente.
            </p>
            <p>
              Cuando los datos ya no sean necesarios, serán eliminados, bloqueados o anonimizados
              conforme a las medidas razonables aplicables.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              8. Derechos ARCO
            </h2>
            <p className="mb-4">
              El usuario tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de
              sus datos personales, así como a revocar el consentimiento otorgado para su uso, en los
              términos previstos por la legislación aplicable.
            </p>
            <p className="mb-4">Para ejercer estos derechos, puede enviar una solicitud al correo:</p>
            <p className="mb-5">
              <a
                href="mailto:privacidad@bombotwerk.com"
                className="text-brand-magenta hover:underline font-medium"
              >
                privacidad@bombotwerk.com
              </a>
            </p>
            <p className="mb-4">La solicitud deberá incluir:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Nombre completo del titular.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Medio de contacto para comunicar la respuesta.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Descripción clara del derecho que desea ejercer.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Datos personales sobre los que desea ejercer el derecho.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-magenta shrink-0" />
                Cualquier documento o información que ayude a identificar la cuenta o relación con Bombo Twerk.
              </li>
            </ul>
            <p className="mt-5">
              Bombo Twerk responderá la solicitud dentro de los plazos establecidos por la normativa
              aplicable.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              9. Seguridad de la información
            </h2>
            <p className="mb-4">
              Bombo Twerk implementa medidas administrativas, técnicas y organizativas razonables para
              proteger los datos personales contra daño, pérdida, alteración, destrucción, uso, acceso
              o tratamiento no autorizado.
            </p>
            <p>
              Sin embargo, ningún sistema de transmisión o almacenamiento en internet es completamente
              infalible. Por ello, recomendamos al usuario proteger sus credenciales de acceso y
              notificar cualquier uso no autorizado de su cuenta.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              10. Menores de edad
            </h2>
            <p>
              El sitio de Bombo Twerk no está dirigido a menores de edad. No recabamos
              intencionalmente datos personales de menores sin autorización de sus padres, madres o
              tutores legales. Si detectamos que se han proporcionado datos de un menor sin
              autorización, podremos eliminarlos de nuestros sistemas.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              11. Cambios al Aviso de Privacidad
            </h2>
            <p className="mb-4">
              Bombo Twerk podrá actualizar este Aviso de Privacidad para reflejar cambios legales,
              técnicos, comerciales o de operación. Las modificaciones estarán disponibles en:
            </p>
            <p className="mb-4">
              <strong className="text-white">https://bombotwerk.com/privacy</strong>
            </p>
            <p>La fecha de última actualización se indicará al inicio del documento.</p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mb-5 pb-3 border-b border-white/10">
              12. Contacto
            </h2>
            <p className="mb-4">
              Para dudas, solicitudes o comentarios relacionados con este Aviso de Privacidad, puedes
              contactarnos en:
            </p>
            <div className="space-y-2">
              <p>
                <strong className="text-white">Correo:</strong>{' '}
                <a
                  href="mailto:privacidad@bombotwerk.com"
                  className="text-brand-magenta hover:underline"
                >
                  privacidad@bombotwerk.com
                </a>
              </p>
              <p>
                <strong className="text-white">Sitio web:</strong>{' '}
                <a
                  href="https://bombotwerk.com"
                  className="text-brand-magenta hover:underline"
                >
                  https://bombotwerk.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Back to home */}
        <div className="mt-16 pt-10 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-xs tracking-widest font-display font-black text-neutral-400 hover:text-brand-magenta transition-colors uppercase"
          >
            ← VOLVER AL INICIO
          </Link>
        </div>
      </article>
    </div>
  );
}
