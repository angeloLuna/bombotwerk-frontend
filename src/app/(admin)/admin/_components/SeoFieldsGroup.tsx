import React from 'react';

interface SeoFieldsGroupProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  extraField?: {
    name: 'canonicalSlug' | 'imageAltText';
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
  };
  onChangeTitle: (val: string) => void;
  onChangeDescription: (val: string) => void;
  onChangeKeywords: (val: string) => void;
  defaultSlug?: string;
  previewPrefix?: string; // e.g. "product" or "colecciones"
  fallbackName?: string;
}

export default function SeoFieldsGroup({
  seoTitle,
  seoDescription,
  seoKeywords,
  extraField,
  onChangeTitle,
  onChangeDescription,
  onChangeKeywords,
  defaultSlug = '',
  previewPrefix = 'product',
  fallbackName = 'Nombre del Elemento',
}: SeoFieldsGroupProps) {
  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;

  // Title range status (Ideal: 50-60)
  const getTitleStatus = () => {
    if (titleLength === 0) return { label: 'Recomendado: 50-60 carac.', colorClass: 'text-neutral-500 bg-neutral-800/50' };
    if (titleLength >= 50 && titleLength <= 60) return { label: 'Excelente longitud', colorClass: 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20' };
    if (titleLength < 50) return { label: `Muy corto (${titleLength}/50)`, colorClass: 'text-amber-400 bg-amber-950/40 border border-amber-500/20' };
    return { label: `Excede límite (${titleLength}/60)`, colorClass: 'text-rose-400 bg-rose-950/40 border border-rose-500/20' };
  };

  // Description range status (Ideal: 140-160)
  const getDescStatus = () => {
    if (descLength === 0) return { label: 'Recomendado: 140-160 carac.', colorClass: 'text-neutral-500 bg-neutral-800/50' };
    if (descLength >= 140 && descLength <= 160) return { label: 'Excelente longitud', colorClass: 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20' };
    if (descLength < 140) return { label: `Muy corto (${descLength}/140)`, colorClass: 'text-amber-400 bg-amber-950/40 border border-amber-500/20' };
    return { label: `Excede límite (${descLength}/160)`, colorClass: 'text-rose-400 bg-rose-950/40 border border-rose-500/20' };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  // Resolved URL preview
  const displaySlug = extraField?.name === 'canonicalSlug' && extraField.value
    ? extraField.value
    : (defaultSlug || 'slug-placeholder');
  const previewUrl = `https://bombotwerk.com/${previewPrefix}/${displaySlug}`;

  // Fallbacks for preview
  const previewTitle = seoTitle || `${fallbackName} | BOMBO TWERK`;
  const previewDesc = seoDescription || 'Define una descripción SEO para visualizar cómo aparecerá este elemento en los resultados de búsqueda de motores como Google. Debe ser conciso y persuasivo.';

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-sm font-display font-black tracking-widest text-brand-magenta uppercase">
          Configuración SEO y Metadatos
        </h3>
        <p className="text-xs text-neutral-400 font-sans mt-1">
          Optimiza la indexación en motores de búsqueda. Los cambios aquí no alteran el diseño del sitio, solo el SEO de la página.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form Inputs */}
        <div className="space-y-4">
          {/* SEO Title */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="seoTitle" className="font-display font-bold text-neutral-300">
                Título SEO (seoTitle)
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${titleStatus.colorClass}`}>
                {titleStatus.label}
              </span>
            </div>
            <input
              id="seoTitle"
              type="text"
              value={seoTitle}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder={`${fallbackName} | BOMBO TWERK`}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-magenta transition-colors"
            />
          </div>

          {/* SEO Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="seoDescription" className="font-display font-bold text-neutral-300">
                Descripción SEO (seoDescription)
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${descStatus.colorClass}`}>
                {descStatus.label}
              </span>
            </div>
            <textarea
              id="seoDescription"
              rows={3}
              value={seoDescription}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="Ej. Descubre el nuevo bodysuit con compresión estructural confeccionado éticamente en CDMX..."
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-magenta transition-colors resize-none"
            />
          </div>

          {/* SEO Keywords */}
          <div className="space-y-1.5">
            <label htmlFor="seoKeywords" className="text-xs font-display font-bold text-neutral-300">
              Palabras Clave (seoKeywords)
            </label>
            <input
              id="seoKeywords"
              type="text"
              value={seoKeywords}
              onChange={(e) => onChangeKeywords(e.target.value)}
              placeholder="Ej. twerk, performancewear, bodysuits, cdmx"
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-magenta transition-colors"
            />
            <p className="text-[10px] text-neutral-500 font-sans">
              Separadas por comas. Ayuda a motores de búsqueda antiguos y catalogación interna.
            </p>
          </div>

          {/* Extra Field: Canonical Slug or Image Alt Text */}
          {extraField && (
            <div className="space-y-1.5">
              <label htmlFor={extraField.name} className="text-xs font-display font-bold text-neutral-300">
                {extraField.label}
              </label>
              <input
                id={extraField.name}
                type="text"
                value={extraField.value}
                onChange={(e) => extraField.onChange(e.target.value)}
                placeholder={extraField.placeholder}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-magenta transition-colors"
              />
              <p className="text-[10px] text-neutral-500 font-sans">
                {extraField.name === 'canonicalSlug'
                  ? 'Especificar solo si este producto consolida el SEO de otro con URL diferente (dejar en blanco para usar el slug actual).'
                  : 'Texto descriptivo alternativo para la imagen de portada de la colección.'}
              </p>
            </div>
          )}
        </div>

        {/* Live Preview Widget */}
        <div className="space-y-3 lg:sticky lg:top-4">
          <span className="block text-xs font-display font-bold text-neutral-400">
            Vista Previa de Google (Dark Mode)
          </span>
          <div className="bg-[#1e1f20] border border-[#2d2e30] rounded-xl p-5 shadow-lg space-y-2 text-left font-sans select-none">
            {/* Header / Brand info */}
            <div className="flex items-center space-x-2 text-[12px] text-[#bdc1c6] truncate">
              <div className="w-5 h-5 rounded-full bg-[#303134] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                B
              </div>
              <div className="flex flex-col truncate leading-tight">
                <span className="text-[12px] text-[#e8eaed] font-medium">BOMBO TWERK</span>
                <span className="text-[11px] text-[#bdc1c6] truncate">{previewUrl}</span>
              </div>
            </div>

            {/* Title link */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="block text-[#8ab4f8] text-lg font-medium hover:underline leading-tight line-clamp-1"
            >
              {previewTitle}
            </a>

            {/* Meta Description snippet */}
            <p className="text-[#bdc1c6] text-[13px] leading-relaxed line-clamp-2">
              {previewDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
