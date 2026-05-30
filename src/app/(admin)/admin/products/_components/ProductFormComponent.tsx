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
import { Plus, Trash2, Loader2, ChevronDown } from 'lucide-react';

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

  function addVariant() {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, defaultVariant()] }));
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

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto = formToCreateDto(form);
      if (productId) {
        await adminApi.products.update(productId, dto);
      } else {
        await adminApi.products.create(dto);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Label>Category *</Label>
            <Select
              required
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              <option value="">— Select Category —</option>
              {['Básicos', 'Falda mesh', 'Cacheteros estampados', 'Cacheteros lisos', 'Sets', 'Tops', 'Accesorios'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {form.category && !['Básicos', 'Falda mesh', 'Cacheteros estampados', 'Cacheteros lisos', 'Sets', 'Tops', 'Accesorios'].includes(form.category) && (
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

        <div className="flex items-center gap-6 pt-1">
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

      {/* ── VARIANTS ── */}
      <SectionCard title={`Variants (${form.variants.length})`}>
        <div className="space-y-6">
          {form.variants.map((variant, vIdx) => (
            <div key={vIdx} className="border border-white/5 rounded-lg p-4 space-y-4 bg-[#0f0f0f]">
              {/* Variant header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-display font-black tracking-widest text-neutral-400">
                  VARIANT {vIdx + 1}
                </span>
                {form.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(vIdx)}
                    className="text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>SKU *</Label>
                  <Input
                    required
                    value={variant.sku}
                    onChange={(e) => setVariant(vIdx, { sku: e.target.value })}
                    placeholder="BT-LP-LEG-001"
                  />
                </div>
                <div>
                  <Label>Color / Style label</Label>
                  <Input
                    value={variant.color}
                    onChange={(e) => setVariant(vIdx, { color: e.target.value })}
                    placeholder="Midnight Black"
                  />
                </div>
              </div>

              {/* Size stocks */}
              <div>
                <Label>Size Stocks</Label>
                <div className="space-y-2 mt-1">
                  {variant.stocks.map((stock, sIdx) => (
                    <div
                      key={sIdx}
                      className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-3"
                    >
                      {/* Size pill */}
                      <div>
                        <span className="text-[9px] font-display font-bold tracking-widest text-neutral-500">SIZE</span>
                        <div className="mt-1 text-xs font-mono font-black text-brand-magenta">
                          {stock.size}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stock.quantity}
                          onChange={(e) =>
                            setStock(vIdx, sIdx, { quantity: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>

                      {/* MTO toggle */}
                      <div className="col-span-2 md:col-span-1">
                        <Toggle
                          checked={stock.madeToOrderEnabled}
                          onChange={(v) => setStock(vIdx, sIdx, { madeToOrderEnabled: v })}
                          label="Made-to-order"
                        />
                      </div>

                      {/* Production days */}
                      {stock.madeToOrderEnabled && (
                        <div className="col-span-2 md:col-span-1">
                          <Label>Prod. Days</Label>
                          <div className="flex gap-1 items-center">
                            <Input
                              type="number"
                              min="1"
                              value={stock.productionDaysMin}
                              onChange={(e) =>
                                setStock(vIdx, sIdx, {
                                  productionDaysMin: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-16"
                              placeholder="5"
                            />
                            <span className="text-neutral-600 text-xs">–</span>
                            <Input
                              type="number"
                              min="1"
                              value={stock.productionDaysMax}
                              onChange={(e) =>
                                setStock(vIdx, sIdx, {
                                  productionDaysMax: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-16"
                              placeholder="7"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add size row */}
                <button
                  type="button"
                  onClick={() =>
                    setVariant(vIdx, {
                      stocks: [
                        ...variant.stocks,
                        {
                          size: 'XL',
                          quantity: 0,
                          madeToOrderEnabled: false,
                          productionDaysMin: 5,
                          productionDaysMax: 7,
                        },
                      ],
                    })
                  }
                  className="flex items-center gap-1 text-[10px] font-display font-bold tracking-widest text-neutral-500 hover:text-brand-magenta transition-colors mt-2"
                >
                  <Plus className="w-3 h-3" /> ADD SIZE
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1.5 text-[10px] font-display font-bold tracking-widest text-brand-magenta hover:text-white transition-colors mt-2"
        >
          <Plus className="w-3.5 h-3.5" /> ADD VARIANT
        </button>
      </SectionCard>
    </form>
  );
}
