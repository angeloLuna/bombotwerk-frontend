'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type {
  AdminCollection,
  ProductForm,
  VariantForm,
  SizeStockForm,
} from '@/types/admin';
import { defaultVariant, defaultSizeStocks, formToCreateDto } from '@/types/admin';
import { adminApi } from '@/lib/admin-api';
import { Plus, Trash2, Loader2, ChevronDown, GripVertical, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import SeoFieldsGroup from '../../_components/SeoFieldsGroup';

// ─── Sub-components ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-display font-bold tracking-widest text-neutral-400 uppercase mb-1">
      {children}
    </label>
  );
}

function Input({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-magenta transition-colors placeholder:text-neutral-700 ${props.className ?? ''}`}
    />
  );
}

function Textarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white font-sans focus:outline-none focus:border-brand-magenta transition-colors placeholder:text-neutral-700 resize-none"
    />
  );
}

function Select({
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-magenta transition-colors pr-8"
      />
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs text-neutral-300"
    >
      <div
        className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${
          checked ? 'bg-brand-magenta' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
      {label}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/5 rounded-xl bg-[#111111] p-5 space-y-4">
      <h3 className="text-[10px] font-display font-black tracking-widest text-brand-magenta uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface ProductFormProps {
  initialValues: ProductForm;
  collections: AdminCollection[];
  productId?: string; // if provided = edit mode
  heading: string;
}

export default function ProductFormComponent({
  initialValues,
  collections,
  productId,
  heading,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<ProductForm>(initialValues);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openVariants, setOpenVariants] = React.useState<Record<number, boolean>>({ 0: true });

  const [gallery, setGallery] = React.useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = React.useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [existingSkus, setExistingSkus] = React.useState<string[]>([]);

  const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);
  const [uploadAlt, setUploadAlt] = React.useState('');
  const [uploadType, setUploadType] = React.useState('catalog');
  const [uploadView, setUploadView] = React.useState<string>('not_applicable');
  const [uploadIsCover, setUploadIsCover] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [urlInput, setUrlInput] = React.useState('');
  const [urlAlt, setUrlAlt] = React.useState('');
  const [urlType, setUrlType] = React.useState('catalog');
  const [urlView, setUrlView] = React.useState<string>('not_applicable');
  const [urlIsCover, setUrlIsCover] = React.useState(false);

  const [imageSourceTab, setImageSourceTab] = React.useState<'upload' | 'url'>('upload');
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const [imageError, setImageError] = React.useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = React.useState<string | null>(null);

  const fetchImages = React.useCallback(async () => {
    if (!productId) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/products/${productId}/images`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
        setDeletedImageIds([]);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  }, [productId]);

  React.useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId, fetchImages]);

  React.useEffect(() => {
    async function loadAllProducts() {
      try {
        const list = await adminApi.products.list();
        const skus: string[] = [];
        list.forEach((p) => {
          if (p.id === productId) return;
          p.variants?.forEach((v) => {
            if (v.sku) skus.push(v.sku.toUpperCase());
          });
        });
        setExistingSkus(skus);
      } catch (err) {
        console.error('Failed to load existing SKUs:', err);
      }
    }
    loadAllProducts();
  }, [productId]);

  React.useEffect(() => {
    // Automatically generate first variant SKU if empty on name/category/color changes
    setForm((prev) => {
      let modified = false;
      const updatedVariants = prev.variants.map((v, idx) => {
        if (!v.sku && (prev.name || prev.category || v.color)) {
          const base = generateBaseSkuString(prev.name, prev.category, v.color);
          const unique = getUniqueSku(base, idx, prev.variants);
          modified = true;
          return { ...v, sku: unique };
        }
        return v;
      });
      if (modified) {
        return { ...prev, variants: updatedVariants };
      }
      return prev;
    });
  }, [form.name, form.category, form.variants.map(v => v.color).join(',')]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ── Variant helpers ────────────────────────────────────────────────────────

  function setVariant(vIdx: number, update: Partial<VariantForm>) {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[vIdx] = { ...variants[vIdx], ...update };
      return { ...prev, variants };
    });
  }

  function setStock(vIdx: number, sIdx: number, update: Partial<SizeStockForm>) {
    setForm((prev) => {
      const variants = [...prev.variants];
      const stocks = [...variants[vIdx].stocks];
      stocks[sIdx] = { ...stocks[sIdx], ...update };
      variants[vIdx] = { ...variants[vIdx], stocks };
      return { ...prev, variants };
    });
  }

  function generateBaseSkuString(name: string, category: string, color: string): string {
    const prefix = 'BOM';
    const catClean = (category || '').trim().toLowerCase();
    let catPart = 'PRO';
    if (catClean) {
      if (catClean.includes('arnes')) catPart = 'ARN';
      else if (catClean.includes('body')) catPart = 'BOD';
      else if (catClean.includes('conjunto')) catPart = 'CON';
      else if (catClean.includes('cachetero')) catPart = 'CAC';
      else if (catClean.includes('falda')) catPart = 'FAL';
      else if (catClean.includes('top')) catPart = 'TOP';
      else if (catClean.includes('accesorio')) catPart = 'ACC';
      else if (catClean.includes('basico')) catPart = 'BAS';
      else {
        const norm = catClean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        catPart = norm.substring(0, 3).toUpperCase().padEnd(3, 'X');
      }
    }
    
    let namePart = 'PRD';
    const cleanName = (name || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '');
    
    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const filtered = words.filter(w => {
        const lowerW = w.toLowerCase();
        const isCat = catClean.includes(lowerW.substring(0, 3)) || lowerW.includes(catClean.substring(0, 3));
        const isCol = color && (color.toLowerCase().includes(lowerW.substring(0, 3)) || lowerW.includes(color.toLowerCase().substring(0, 3)));
        return !isCat && !isCol;
      });
      const wordsToUse = filtered.length > 0 ? filtered : words;
      if (wordsToUse.length >= 2) {
        namePart = wordsToUse.slice(0, 2).map(w => w.substring(0, 3)).join('-');
      } else {
        namePart = wordsToUse[0]?.substring(0, 3) || 'PRD';
      }
    }
    
    let colorPart = '';
    if (color) {
      const cleanColor = color
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      colorPart = cleanColor.substring(0, 3);
    }
    
    const parts = [prefix, catPart, namePart, colorPart].filter(Boolean);
    return parts.join('-');
  }

  function getUniqueSku(baseSku: string, currentVariantIdx: number, variantsList = form.variants): string {
    let candidate = baseSku;
    let counter = 2;
    
    const isDuplicate = (sku: string) => {
      const upperSku = sku.toUpperCase();
      if (existingSkus.includes(upperSku)) return true;
      return variantsList.some((v, idx) => idx !== currentVariantIdx && v.sku.toUpperCase() === upperSku);
    };

    while (isDuplicate(candidate)) {
      candidate = `${baseSku}-${counter}`;
      counter++;
    }
    
    return candidate;
  }

  function handleGenerateSku(vIdx: number, force = false) {
    const variant = form.variants[vIdx];
    const generatedBase = generateBaseSkuString(form.name, form.category, variant.color);
    const uniqueSku = getUniqueSku(generatedBase, vIdx);

    if (variant.sku && variant.sku !== uniqueSku && !force) {
      if (!confirm(`El SKU actual ("${variant.sku}") ya existe o difiere del sugerido. ¿Deseas sobrescribirlo con el sugerido ("${uniqueSku}")?`)) {
        return;
      }
    }
    
    setVariant(vIdx, { sku: uniqueSku });
  }

  function addVariant() {
    const v = defaultVariant();
    setForm((prev) => {
      const nextVariants = [...prev.variants, v];
      const base = generateBaseSkuString(prev.name, prev.category, v.color);
      const unique = getUniqueSku(base, nextVariants.length - 1, nextVariants);
      nextVariants[nextVariants.length - 1] = { ...v, sku: unique };
      
      const newIdx = nextVariants.length - 1;
      setTimeout(() => {
        setOpenVariants((prevOpen) => ({ ...prevOpen, [newIdx]: true }));
      }, 50);

      return { ...prev, variants: nextVariants };
    });
  }

  function removeVariant(idx: number) {
    if (form.variants.length === 1) return; // keep at least one
    setForm((prev) => {
      const variants = prev.variants.filter((_, i) => i !== idx);
      return { ...prev, variants };
    });
  }

  // ── Media helpers ──────────────────────────────────────────────────────────

  function setMediaUrl(idx: number, value: string) {
    const urls = [...form.mediaUrls];
    urls[idx] = value;
    setField('mediaUrls', urls);
  }

  function addMediaUrl() {
    setField('mediaUrls', [...form.mediaUrls, '']);
  }

  function removeMediaUrl(idx: number) {
    setField('mediaUrls', form.mediaUrls.filter((_, i) => i !== idx));
  }

  function handleDrop(targetIdx: number) {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const reorderedList = [...gallery];
    const [removed] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(targetIdx, 0, removed);
    
    const updatedList = reorderedList.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));
    setGallery(updatedList);
    setDraggedIndex(null);
    setHasUnsavedChanges(true);
  }

  async function handleSaveImages() {
    if (!productId) return;
    setUploading(true);
    setImageError(null);
    setImageSuccess(null);

    try {
      // 1. Upload new raw files to R2 first
      const uploadedImages = await Promise.all(
        gallery.map(async (item) => {
          if (item.file) {
            const res = await adminApi.products.uploadRawImage(productId, item.file);
            return {
              ...item,
              url: res.url,
              key: res.key,
              file: undefined, // remove raw file reference
            };
          }
          return item;
        })
      );

      // 2. Prepare bulk payload
      const imagesPayload = uploadedImages.map((item, index) => ({
        id: item.id || undefined,
        url: item.url,
        key: item.key || null,
        alt: item.alt || null,
        type: item.type,
        view: item.view || 'not_applicable',
        sortOrder: index,
        isCover: item.isCover || false,
      }));

      // 3. Request bulk save on backend
      const result = await adminApi.products.bulkUpdateImages(productId, {
        images: imagesPayload,
        deletedImageIds,
      });

      // 4. Update local state with database results
      setGallery(result);
      setDeletedImageIds([]);
      setHasUnsavedChanges(false);
      setImageSuccess('Galería de imágenes guardada con éxito.');
    } catch (err: any) {
      console.error('Failed to save gallery:', err);
      setImageError(err.message ?? 'Error al guardar los cambios de imágenes.');
    } finally {
      setUploading(false);
    }
  }

  async function uploadVariantImages(pId: string, currentVariants: VariantForm[]): Promise<VariantForm[]> {
    const updatedVariants = [...currentVariants];
    for (let vIdx = 0; vIdx < updatedVariants.length; vIdx++) {
      const variant = updatedVariants[vIdx];
      if (variant.images && variant.images.length > 0) {
        const updatedImages = await Promise.all(
          variant.images.map(async (img) => {
            if (img.file) {
              const res = await adminApi.products.uploadRawImage(pId, img.file);
              return {
                url: res.url,
                key: res.key,
                alt: variant.color || 'Variant image',
              };
            }
            return {
              url: img.url,
              key: img.key || null,
              alt: img.alt || img.altText || null,
            };
          })
        );
        updatedVariants[vIdx] = { ...variant, images: updatedImages };
      }
    }
    return updatedVariants;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // 1. Validate form local SKU uniqueness
    const formSkus = form.variants.map((v) => v.sku.trim().toUpperCase());
    const uniqueFormSkus = new Set(formSkus);
    if (uniqueFormSkus.size !== formSkus.length) {
      setError('Error: Hay SKUs duplicados en las variantes del formulario. Cada variante debe tener un SKU único.');
      setSaving(false);
      return;
    }

    // 2. Validate database SKU uniqueness
    const duplicatesInDb = formSkus.filter((sku) => existingSkus.includes(sku));
    if (duplicatesInDb.length > 0) {
      setError(`Error: Los siguientes SKUs ya están registrados en la base de datos por otros productos: ${duplicatesInDb.join(', ')}. Por favor, edítalos para que sean únicos.`);
      setSaving(false);
      return;
    }

    try {
      if (productId) {
        // Edit mode: upload variant files first
        const uploadedVariants = await uploadVariantImages(productId, form.variants);
        const dto = formToCreateDto({ ...form, variants: uploadedVariants });
        await adminApi.products.update(productId, dto);
      } else {
        // Create mode:
        // 1. Create product first without variant images to avoid sending local blob URLs
        const initialVariants = form.variants.map((v) => ({ ...v, images: [] }));
        const initialDto = formToCreateDto({ ...form, variants: initialVariants });
        const createdProduct = await adminApi.products.create(initialDto);

        // 2. Upload variant files with newly created product ID
        const uploadedVariants = await uploadVariantImages(createdProduct.id, form.variants);

        // 3. Update the product variants with their uploaded images
        const finalDto = formToCreateDto({ ...form, variants: uploadedVariants });
        await adminApi.products.update(createdProduct.id, finalDto);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">{heading}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-display font-bold tracking-widest text-neutral-400 border border-white/10 rounded-lg hover:text-white hover:border-white/30 transition-all"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-brand-magenta text-black text-xs font-display font-black tracking-widest px-5 py-2.5 rounded-lg hover:bg-brand-magenta/90 transition-colors shadow-magenta-glow disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'SAVING…' : productId ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {form.isActive && (!form.seoTitle || !form.seoDescription) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-xs text-amber-500 space-y-1">
          <p className="font-bold">Advertencias de SEO no bloqueantes:</p>
          <ul className="list-disc list-inside space-y-0.5 font-sans">
            {!form.seoTitle && <li>Este producto está publicado pero no tiene SEO title.</li>}
            {!form.seoDescription && <li>Este producto está publicado pero no tiene SEO description.</li>}
          </ul>
        </div>
      )}

      {/* ── BASIC INFO ── */}
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => {
                setField('name', e.target.value);
                if (!productId) setField('slug', autoSlug(e.target.value));
              }}
              placeholder="e.g. LATIN PULSE LEGGING"
            />
          </div>
          <div>
            <Label>Slug *</Label>
            <Input
              required
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="latin-pulse-legging"
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Describe the product…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Price (MXN) *</Label>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              placeholder="1850"
            />
          </div>
          <div>
            <Label>Compare At Price (MXN)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => setField('compareAtPrice', e.target.value)}
              placeholder="e.g. 2200"
            />
          </div>
          <div>
            <Label>Category *</Label>
            <Select
              required
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              <option value="">— Select Category —</option>
              {['cacheteros', 'bodys', 'conjuntos', 'faldas-flecos', 'arneses', 'Básicos', 'Falda mesh', 'Cacheteros estampados', 'Sets', 'Tops', 'Accesorios'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {form.category && !['cacheteros', 'bodys', 'conjuntos', 'faldas-flecos', 'arneses', 'Básicos', 'Falda mesh', 'Cacheteros estampados', 'Sets', 'Tops', 'Accesorios'].includes(form.category) && (
                <option value={form.category}>{form.category}</option>
              )}
            </Select>
          </div>
          <div>
            <Label>Collection</Label>
            <Select
              value={form.collectionId}
              onChange={(e) => setField('collectionId', e.target.value)}
            >
              <option value="">— None —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <Toggle
            checked={form.isActive}
            onChange={(v) => setField('isActive', v)}
            label="Active (visible in storefront)"
          />
          <Toggle
            checked={form.isNewArrival}
            onChange={(v) => setField('isNewArrival', v)}
            label="New Arrival badge"
          />
          <Toggle
            checked={form.isFeatured}
            onChange={(v) => setField('isFeatured', v)}
            label="Featured in Homepage"
          />
        </div>
      </SectionCard>

      {/* ── MEDIA ── */}
      <SectionCard title="Product Images (URLs)">
        <div className="space-y-2">
          {form.mediaUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => setMediaUrl(idx, e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1"
              />
              {form.mediaUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMediaUrl(idx)}
                  className="p-2 text-neutral-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addMediaUrl}
          className="flex items-center gap-1.5 text-[10px] font-display font-bold tracking-widest text-brand-magenta hover:text-white transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" /> ADD IMAGE URL
        </button>
      </SectionCard>

      {/* ── PHOTO MANAGER SECTION (Only in edit mode) ── */}
      {productId ? (
        <SectionCard title="Gestor de Fotos del Atelier">
          {/* Success / Error feedback */}
          {imageSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5 text-xs text-green-400">
              {imageSuccess}
            </div>
          )}
          {imageError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-xs text-red-400">
              {imageError}
            </div>
          )}

          {/* Pending Changes Warning Banner */}
          {hasUnsavedChanges && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-xs text-amber-400 flex items-center justify-between font-sans">
              <span>⚠️ Tienes cambios pendientes sin guardar en la galería.</span>
              <span className="font-bold tracking-widest uppercase text-[9px] bg-amber-500/20 px-2 py-0.5 rounded">Pendiente</span>
            </div>
          )}

          {/* Tab switcher for Image Sources */}
          <div className="flex border-b border-white/5 pb-2 mb-4 gap-4">
            <button
              type="button"
              onClick={() => setImageSourceTab('upload')}
              className={`flex items-center gap-2 pb-2 text-xs font-display font-bold tracking-wider uppercase border-b-2 transition-all ${
                imageSourceTab === 'upload'
                  ? 'border-brand-magenta text-white font-black'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Subir Archivos
            </button>
            <button
              type="button"
              onClick={() => setImageSourceTab('url')}
              className={`flex items-center gap-2 pb-2 text-xs font-display font-bold tracking-wider uppercase border-b-2 transition-all ${
                imageSourceTab === 'url'
                  ? 'border-brand-magenta text-white font-black'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Agregar Enlaces URL
            </button>
          </div>

          {/* Upload File Tab */}
          {imageSourceTab === 'upload' && (
            <div className="border border-dashed border-white/10 rounded-xl p-5 bg-white/[0.01] space-y-4">
              <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Cargar fotos locales a la galería (R2)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Seleccionar uno o más archivos (JPEG, PNG, WEBP)</Label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setUploadFiles(files);
                    }}
                    className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-magenta/10 file:text-brand-magenta hover:file:bg-brand-magenta/20 file:cursor-pointer"
                  />
                  {uploadFiles.length > 0 && (
                    <span className="text-[10px] text-brand-magenta font-mono block mt-1">
                      {uploadFiles.length} archivo(s) seleccionado(s)
                    </span>
                  )}
                </div>
                <div>
                  <Label>Texto Alternativo por Defecto (Alt)</Label>
                  <Input
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="e.g. Silueta Bombo Twerk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de Imagen</Label>
                  <Select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                  >
                    <option value="catalog">Catálogo (Fondo blanco / limpia)</option>
                    <option value="editorial">Editorial (Campaña / Branding)</option>
                    <option value="detail">Detalle (Zoom a materiales/texturas)</option>
                    <option value="technical">Ficha Técnica (Informativa)</option>
                    <option value="styling">Styling (Mood / Combinación)</option>
                    <option value="community">Comunidad (Foto de clientas)</option>
                  </Select>
                </div>
                <div>
                  <Label>Vista / Ángulo</Label>
                  <Select
                    value={uploadView}
                    onChange={(e) => setUploadView(e.target.value)}
                  >
                    <option value="not_applicable">No Aplica / General</option>
                    <option value="front">Frente</option>
                    <option value="back">Espalda</option>
                    <option value="side">Costado</option>
                    <option value="detail">Detalle close-up</option>
                  </Select>
                </div>
                <div className="flex items-center pt-4">
                  <Toggle
                    checked={uploadIsCover}
                    onChange={setUploadIsCover}
                    label="Hacer Portada (primer archivo)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={uploadFiles.length === 0}
                  onClick={() => {
                    if (uploadFiles.length === 0) return;
                    const newItems = uploadFiles.map((file, idx) => ({
                      localId: `local-${Date.now()}-${idx}-${Math.random()}`,
                      file,
                      url: URL.createObjectURL(file),
                      key: null,
                      alt: uploadAlt,
                      type: uploadType,
                      view: uploadView,
                      isCover: uploadIsCover && idx === 0,
                      sortOrder: gallery.length + idx,
                    }));
                    
                    setGallery((prev) => {
                      let updated = [...prev];
                      if (uploadIsCover) {
                        updated = updated.map((item) => ({ ...item, isCover: false }));
                      }
                      return [...updated, ...newItems];
                    });
                    
                    setHasUnsavedChanges(true);
                    setUploadFiles([]);
                    setUploadAlt('');
                    setUploadIsCover(false);
                    
                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-display font-black tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" /> AÑADIR A LA LISTA
                </button>
              </div>
            </div>
          )}

          {/* Add URL Tab */}
          {imageSourceTab === 'url' && (
            <div className="border border-dashed border-white/10 rounded-xl p-5 bg-white/[0.01] space-y-4">
              <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Vincular enlaces de imágenes externas
              </h4>
              <div>
                <Label>Enlaces de Imágenes (Pega uno por línea) *</Label>
                <Textarea
                  rows={3}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Texto Alternativo (Alt)</Label>
                  <Input
                    value={urlAlt}
                    onChange={(e) => setUrlAlt(e.target.value)}
                    placeholder="e.g. Colección Twerk"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <Toggle
                    checked={urlIsCover}
                    onChange={setUrlIsCover}
                    label="Hacer Portada (primer enlace)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Imagen</Label>
                  <Select
                    value={urlType}
                    onChange={(e) => setUrlType(e.target.value)}
                  >
                    <option value="catalog">Catálogo (Fondo blanco / limpia)</option>
                    <option value="editorial">Editorial (Campaña / Branding)</option>
                    <option value="detail">Detalle (Zoom a materiales/texturas)</option>
                    <option value="technical">Ficha Técnica (Informativa)</option>
                    <option value="styling">Styling (Mood / Combinación)</option>
                    <option value="community">Comunidad (Foto de clientas)</option>
                  </Select>
                </div>
                <div>
                  <Label>Vista / Ángulo</Label>
                  <Select
                    value={urlView}
                    onChange={(e) => setUrlView(e.target.value)}
                  >
                    <option value="not_applicable">No Aplica / General</option>
                    <option value="front">Frente</option>
                    <option value="back">Espalda</option>
                    <option value="side">Costado</option>
                    <option value="detail">Detalle close-up</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={!urlInput.trim()}
                  onClick={() => {
                    const urls = urlInput.split('\n').map((u) => u.trim()).filter(Boolean);
                    if (urls.length === 0) return;
                    
                    const newItems = urls.map((url, idx) => ({
                      url,
                      key: null,
                      alt: urlAlt,
                      type: urlType,
                      view: urlView,
                      isCover: urlIsCover && idx === 0,
                      sortOrder: gallery.length + idx,
                    }));
                    
                    setGallery((prev) => {
                      let updated = [...prev];
                      if (urlIsCover) {
                        updated = updated.map((item) => ({ ...item, isCover: false }));
                      }
                      return [...updated, ...newItems];
                    });
                    
                    setHasUnsavedChanges(true);
                    setUrlInput('');
                    setUrlAlt('');
                    setUrlIsCover(false);
                  }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-display font-black tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" /> AÑADIR A LA LISTA
                </button>
              </div>
            </div>
          )}

          {/* List of images with Drag and Drop */}
          {gallery.length > 0 ? (
            <div className="space-y-4">
              <span className="text-[9px] font-sans text-neutral-500 block italic">
                💡 Arrastra y suelta usando el control vertical para ordenar. Los cambios solo se aplicarán al hacer click en Guardar.
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gallery.map((img, idx) => {
                  const typeLabel = {
                    catalog: 'Catálogo',
                    editorial: 'Editorial',
                    detail: 'Detalle',
                    technical: 'Ficha Técnica',
                    styling: 'Styling',
                    community: 'Comunidad',
                  }[img.type as string] || img.type;

                  const viewLabel = {
                    not_applicable: 'General',
                    front: 'Frente',
                    back: 'Espalda',
                    side: 'Costado',
                    detail: 'Detalle',
                  }[img.view as string] || img.view || 'General';

                  const isNew = !img.id;

                  return (
                    <div
                      key={img.id || img.localId}
                      draggable
                      onDragStart={() => setDraggedIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(idx)}
                      className={`border rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 relative ${
                        draggedIndex === idx
                          ? 'border-brand-magenta bg-brand-magenta/5 opacity-50 scale-95 shadow-magenta-glow'
                          : isNew
                          ? 'border-green-500/20 bg-green-500/[0.01]'
                          : 'border-white/5 bg-[#0f0f0f] hover:border-white/10'
                      }`}
                    >
                      {/* Drag Handle */}
                      <div 
                        className="absolute top-4 right-4 text-neutral-600 hover:text-white cursor-grab active:cursor-grabbing p-1"
                        title="Arrastrar para ordenar"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="space-y-3">
                        {/* Image Preview & Cover Badge */}
                        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-brand-charcoal border border-white/5">
                          <img src={img.url} alt={img.alt || 'Producto'} className="w-full h-full object-cover" />
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {img.isCover && (
                              <span className="bg-brand-magenta text-black text-[8px] font-black tracking-widest px-2 py-0.5 rounded shadow-lg uppercase block w-fit font-display font-black">
                                PORTADA
                              </span>
                            )}
                            {isNew && (
                              <span className="bg-green-500 text-black text-[8px] font-black tracking-widest px-2 py-0.5 rounded shadow-lg uppercase block w-fit font-display font-black">
                                NUEVO
                              </span>
                            )}
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/70 border border-white/10 text-white text-[8px] font-mono px-2 py-0.5 rounded uppercase">
                            {typeLabel} · {viewLabel}
                          </span>
                        </div>

                        {/* Metadata Edit Fields */}
                        <div className="space-y-3">
                          <div>
                            <Label>Texto Alternativo (Alt)</Label>
                            <Input
                              value={img.alt || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGallery((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, alt: val } : item))
                                );
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Texto descriptivo para SEO"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Tipo</Label>
                              <Select
                                value={img.type}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGallery((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, type: val } : item))
                                  );
                                  setHasUnsavedChanges(true);
                                }}
                              >
                                <option value="catalog">Catálogo</option>
                                <option value="editorial">Editorial</option>
                                <option value="detail">Detalle</option>
                                <option value="technical">Técnica</option>
                                <option value="styling">Styling</option>
                                <option value="community">Comunidad</option>
                              </Select>
                            </div>
                            <div>
                              <Label>Vista / Ángulo</Label>
                              <Select
                                value={img.view || 'not_applicable'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGallery((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, view: val } : item))
                                  );
                                  setHasUnsavedChanges(true);
                                }}
                              >
                                <option value="not_applicable">General</option>
                                <option value="front">Frente</option>
                                <option value="back">Espalda</option>
                                <option value="side">Costado</option>
                                <option value="detail">Detalle</option>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isNew) {
                              setGallery((prev) => prev.filter((_, i) => i !== idx));
                              setHasUnsavedChanges(true);
                            } else {
                              if (confirm('¿Eliminar esta foto? Los cambios se guardarán al presionar el botón global.')) {
                                setDeletedImageIds((prev) => [...prev, img.id]);
                                setGallery((prev) => prev.filter((_, i) => i !== idx));
                                setHasUnsavedChanges(true);
                              }
                            }
                          }}
                          className="text-xs text-neutral-500 hover:text-red-400 font-display font-bold tracking-wider transition-colors uppercase py-1"
                        >
                          Eliminar
                        </button>
                        <div className="flex gap-2">
                          {!img.isCover && (
                            <button
                              type="button"
                              onClick={() => {
                                setGallery((prev) =>
                                  prev.map((item, i) => ({ ...item, isCover: i === idx }))
                                );
                                setHasUnsavedChanges(true);
                              }}
                              className="text-[10px] font-display font-bold text-brand-magenta hover:text-white transition-colors uppercase border border-brand-magenta/20 hover:border-brand-magenta/40 px-2 py-1.5 rounded bg-brand-magenta/5"
                            >
                              Hacer Portada
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Global Save ButtonSticky */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 bg-[#111111] p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-display font-bold tracking-widest text-neutral-400 block uppercase">
                    Acciones de la Galería
                  </span>
                  <span className="text-xs text-neutral-500 font-sans">
                    {hasUnsavedChanges 
                      ? '⚠️ Tienes cambios pendientes de guardar.'
                      : 'Galería sincronizada con el servidor.'}
                  </span>
                </div>
                <div className="flex gap-3">
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('¿Descartar todos los cambios locales y volver a cargar desde el servidor?')) {
                          await fetchImages();
                        }
                      }}
                      className="px-4 py-2 text-xs font-display font-bold tracking-widest text-neutral-400 border border-white/5 rounded-lg hover:text-white hover:border-white/20 transition-all uppercase"
                    >
                      Descartar cambios
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={uploading || !hasUnsavedChanges}
                    onClick={handleSaveImages}
                    className="flex items-center gap-2 bg-brand-magenta text-black text-xs font-display font-black tracking-widest px-6 py-2.5 rounded-lg hover:bg-brand-magenta/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase shadow-magenta-glow"
                  >
                    {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {uploading ? 'Guardando galería...' : 'Guardar cambios de imágenes'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic py-4 text-center">
              No hay imágenes cargadas en la galería para este producto.
            </p>
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Gestor de Fotos del Atelier">
          <p className="text-xs text-neutral-500 italic py-2 text-center">
            Para subir imágenes, primero debes crear y guardar el producto básico.
          </p>
        </SectionCard>
      )}

      {/* ── VARIANTS ── */}
      <SectionCard title={`Variants (${form.variants.length})`}>
        <div className="space-y-4">
          {form.variants.map((variant, vIdx) => {
            const isOpen = !!openVariants[vIdx];
            return (
              <div key={vIdx} className="border border-white/5 rounded-lg overflow-hidden bg-[#111111] transition-all">
                {/* Variant Accordion Header */}
                <div
                  onClick={() => setOpenVariants((prev) => ({ ...prev, [vIdx]: !prev[vIdx] }))}
                  className="flex items-center justify-between cursor-pointer p-4 bg-[#141414] hover:bg-[#1a1a1a] rounded-t-lg transition-colors border-b border-white/5 select-none"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail preview */}
                    {variant.images && variant.images[0] ? (
                      <img
                        src={variant.images[0].url}
                        className="w-10 h-10 object-cover rounded border border-white/10"
                        alt="Variant thumbnail"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-dashed border-white/10 flex items-center justify-center text-neutral-600 bg-black/20">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}

                    {/* Variant details */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {variant.sku || 'NUEVA_VARIANTE'}
                        </span>
                        {variant.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/25 inline-block shadow-sm"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        <span className="text-xs text-neutral-400">
                          {variant.color || 'Sin Color'}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 uppercase font-mono font-bold tracking-wider">
                        {variant.availabilityMode === 'stock_only' && 'Solo Stock'}
                        {variant.availabilityMode === 'stock_and_made_to_order' && 'Stock + Bajo Pedido'}
                        {variant.availabilityMode === 'made_to_order_only' && 'Solo Bajo Pedido'}
                        {variant.availabilityMode === 'discontinued' && 'Descontinuado'}
                        {` · ${variant.stocks.reduce((acc, s) => acc + s.quantity, 0)} unidades en stock`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVariant(vIdx);
                        }}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Variant Accordion Content */}
                {isOpen && (
                  <div className="p-4 space-y-4 bg-[#0f0f0f]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>SKU *</Label>
                        <div className="flex gap-2">
                          <Input
                            required
                            value={variant.sku}
                            onChange={(e) => setVariant(vIdx, { sku: e.target.value })}
                            placeholder="BT-LP-LEG-001"
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleGenerateSku(vIdx);
                            }}
                            className="px-3 py-2 text-xs font-display font-bold text-brand-magenta border border-brand-magenta/20 rounded-lg hover:bg-brand-magenta/10 hover:border-brand-magenta/30 transition-all shrink-0 uppercase"
                          >
                            {variant.sku ? 'Regenerar' : 'Generar'}
                          </button>
                        </div>
                        {/* Size-specific SKUs preview */}
                        <div className="mt-2 text-[10px] text-neutral-500 font-mono border border-white/5 bg-brand-dark/25 p-2 rounded">
                          <span className="font-bold text-neutral-400 block mb-1">Previsualización por Talla:</span>
                          <div className="grid grid-cols-5 gap-1 text-center">
                            {variant.stocks.map((s) => (
                              <div key={s.size} className="bg-brand-charcoal/50 py-0.5 rounded border border-white/5">
                                <span className="text-brand-magenta font-bold block">{s.size}</span>
                                <span className="text-[8px] text-neutral-500">{variant.sku ? `${variant.sku}-${s.size}` : '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label>Color / Style label</Label>
                            <Input
                              value={variant.color}
                              onChange={(e) => setVariant(vIdx, { color: e.target.value })}
                              placeholder="Midnight Black"
                            />
                          </div>
                          <div>
                            <Label>Color Hex (#FF0080)</Label>
                            <div className="flex gap-2">
                              <Input
                                value={variant.colorHex || ''}
                                onChange={(e) => setVariant(vIdx, { colorHex: e.target.value })}
                                placeholder="#FF0080"
                                className="flex-1"
                              />
                              <input
                                type="color"
                                value={variant.colorHex && variant.colorHex.startsWith('#') && variant.colorHex.length === 7 ? variant.colorHex : '#ffffff'}
                                onChange={(e) => setVariant(vIdx, { colorHex: e.target.value })}
                                className="w-10 h-10 p-0 border border-white/10 rounded cursor-pointer bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Variant Availability Mode & Production Days */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-white/5 bg-[#141414] p-3 rounded-lg">
                      <div>
                        <Label>Availability Mode *</Label>
                        <Select
                          value={variant.availabilityMode}
                          onChange={(e) => setVariant(vIdx, { availabilityMode: e.target.value })}
                        >
                          <option value="stock_only">Solo stock físico</option>
                          <option value="stock_and_made_to_order">Stock físico + Bajo pedido</option>
                          <option value="made_to_order_only">Solo bajo pedido (MTO)</option>
                          <option value="discontinued">Descontinuado</option>
                        </Select>
                      </div>
                      {(variant.availabilityMode === 'stock_and_made_to_order' || variant.availabilityMode === 'made_to_order_only') && (
                        <>
                          <div>
                            <Label>Prod. Days Min</Label>
                            <Input
                              type="number"
                              min="1"
                              value={variant.madeToOrderMinDays}
                              onChange={(e) =>
                                setVariant(vIdx, {
                                  madeToOrderMinDays: parseInt(e.target.value) || 1,
                                })
                              }
                              placeholder="7"
                            />
                          </div>
                          <div>
                            <Label>Prod. Days Max</Label>
                            <Input
                              type="number"
                              min="1"
                              value={variant.madeToOrderMaxDays}
                              onChange={(e) =>
                                setVariant(vIdx, {
                                  madeToOrderMaxDays: parseInt(e.target.value) || 1,
                                })
                              }
                              placeholder="9"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Size stocks */}
                    <div>
                      <Label>Size Stocks</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-1">
                        {variant.stocks.map((stock, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between gap-2 bg-[#1a1a1a] border border-white/5 rounded-lg px-2 py-1.5"
                          >
                            {/* Size label */}
                            <div>
                              <span className="text-[7px] font-display font-bold tracking-widest text-neutral-500 block">SIZE</span>
                              <span className="text-xs font-mono font-black text-brand-magenta">{stock.size}</span>
                            </div>

                            {/* Quantity input */}
                            <div className="w-14">
                              <Input
                                type="number"
                                min="0"
                                value={stock.quantity}
                                onChange={(e) =>
                                  setStock(vIdx, sIdx, { quantity: parseInt(e.target.value) || 0 })
                                }
                                className="py-1 px-1.5 text-center text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Variant Image Manager */}
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <Label>Imágenes de la Variante</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;

                            const newItems = files.map((file) => ({
                              file,
                              url: URL.createObjectURL(file),
                              key: null,
                            }));
                            setVariant(vIdx, {
                              images: [...(variant.images || []), ...newItems]
                            });
                            e.target.value = '';
                          }}
                          className="w-full text-xs text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-brand-magenta/10 file:text-brand-magenta hover:file:bg-brand-magenta/20 file:cursor-pointer"
                        />
                      </div>
                      {variant.images && variant.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                          {variant.images.map((img: any, imgIdx: number) => (
                            <div key={imgIdx} className="relative aspect-square rounded-lg bg-[#151515] border border-white/5 overflow-hidden group">
                              <img src={img.url} className="w-full h-full object-cover" alt="Variant preview" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = [...variant.images];
                                      newImages.splice(imgIdx, 1);
                                      setVariant(vIdx, { images: newImages });
                                    }}
                                    className="p-1 bg-black/80 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded transition-colors"
                                    title="Eliminar foto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="bg-black/70 border border-white/10 text-[8px] font-mono px-1 rounded text-white">
                                    #{imgIdx + 1}
                                  </span>
                                  <div className="flex gap-1">
                                    {imgIdx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newImages = [...variant.images];
                                          const temp = newImages[imgIdx];
                                          newImages[imgIdx] = newImages[imgIdx - 1];
                                          newImages[imgIdx - 1] = temp;
                                          setVariant(vIdx, { images: newImages });
                                        }}
                                        className="p-1 bg-black/80 hover:bg-brand-magenta text-white rounded transition-colors text-[9px] font-mono leading-none"
                                        title="Mover atrás"
                                      >
                                        ←
                                      </button>
                                    )}
                                    {imgIdx < variant.images.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newImages = [...variant.images];
                                          const temp = newImages[imgIdx];
                                          newImages[imgIdx] = newImages[imgIdx + 1];
                                          newImages[imgIdx + 1] = temp;
                                          setVariant(vIdx, { images: newImages });
                                        }}
                                        className="p-1 bg-black/80 hover:bg-brand-magenta text-white rounded transition-colors text-[9px] font-mono leading-none"
                                        title="Mover adelante"
                                      >
                                        →
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-600 italic">No hay imágenes asignadas a esta variante.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1.5 text-[10px] font-display font-bold tracking-widest text-brand-magenta hover:text-white transition-colors mt-4"
        >
          <Plus className="w-3.5 h-3.5" /> ADD VARIANT
        </button>
      </SectionCard>

      <SeoFieldsGroup
        seoTitle={form.seoTitle}
        seoDescription={form.seoDescription}
        seoKeywords={form.seoKeywords}
        extraField={{
          name: 'canonicalSlug',
          label: 'Slug Canónico (canonicalSlug)',
          placeholder: 'latin-pulse-legging-alternative',
          value: form.canonicalSlug,
          onChange: (val) => setField('canonicalSlug', val),
        }}
        onChangeTitle={(val) => setField('seoTitle', val)}
        onChangeDescription={(val) => setField('seoDescription', val)}
        onChangeKeywords={(val) => setField('seoKeywords', val)}
        defaultSlug={form.slug}
        previewPrefix="product"
        fallbackName={form.name}
      />
    </form>
  );
}
