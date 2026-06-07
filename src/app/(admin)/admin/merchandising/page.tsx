'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { ProductTypeCard } from '@/types/merchandising';
import { Plus, Pencil, Check, X, Loader2, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

type EditState = Partial<ProductTypeCard> & { id?: string };

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMPTY_FORM: Omit<ProductTypeCard, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  imageAlt: '',
  badgeLabel: '',
  badgeType: '',
  href: '',
  linkType: 'category',
  sortOrder: 0,
  isActive: true,
  highlight: false,
};

export default function AdminMerchandisingPage() {
  const [cards, setCards] = useState<ProductTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline editing / creating state
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ ...EMPTY_FORM });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCards(await adminApi.merchandising.productTypeCards.list());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load merchandising cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Create ────────────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await adminApi.merchandising.productTypeCards.create(newForm);
      setCards((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setShowNew(false);
      setNewForm({ ...EMPTY_FORM });
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to create card');
    } finally {
      setSaving(false);
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.id) return;
    setSaving(true);
    setFormError(null);
    try {
      const { id, createdAt, updatedAt, ...body } = editing;
      const updated = await adminApi.merchandising.productTypeCards.update(id, body);
      setCards((prev) =>
        prev
          .map((c) => (c.id === updated.id ? updated : c))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      );
      setEditing(null);
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to update card');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;
    try {
      await adminApi.merchandising.productTypeCards.delete(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete card');
    }
  }

  // ── Form rows ─────────────────────────────────────────────────────────────

  const inputCls =
    'bg-[#0f0f0f] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-magenta transition-colors w-full';

  function renderCardRow(c: ProductTypeCard) {
    const isEditing = editing?.id === c.id;

    if (isEditing) {
      return (
        <tr className="bg-brand-magenta/5 border-b border-brand-magenta/20" key={c.id}>
          <td className="px-4 py-4" colSpan={6}>
            <form onSubmit={handleUpdate} className="space-y-4">
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                  {formError}
                </p>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Nombre Visible *</label>
                    <input
                      className={inputCls}
                      required
                      value={editing.title ?? ''}
                      onChange={(e) => {
                        setEditing((prev) => ({
                          ...prev,
                          title: e.target.value,
                          slug: slugify(e.target.value),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Slug *</label>
                    <input
                      className={inputCls}
                      required
                      value={editing.slug ?? ''}
                      onChange={(e) => setEditing((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Link Destino (Href) *</label>
                    <input
                      className={inputCls}
                      required
                      value={editing.href ?? ''}
                      onChange={(e) => setEditing((prev) => ({ ...prev, href: e.target.value }))}
                      placeholder="/tienda?category=cacheteros"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Tipo de Link *</label>
                    <select
                      className={inputCls}
                      required
                      value={editing.linkType ?? 'category'}
                      onChange={(e) => setEditing((prev) => ({ ...prev, linkType: e.target.value }))}
                    >
                      <option value="category">Categoría (e.g. tienda?category=...)</option>
                      <option value="collection">Colección (e.g. colecciones/...)</option>
                      <option value="search">Búsqueda / Filtro</option>
                      <option value="offer">Oferta / Promoción</option>
                      <option value="external">URL Externa o Interna General</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Etiqueta de Badge (Badge Label)</label>
                    <input
                      className={inputCls}
                      value={editing.badgeLabel ?? ''}
                      onChange={(e) => setEditing((prev) => ({ ...prev, badgeLabel: e.target.value }))}
                      placeholder="OFERTA, NUEVO, etc."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Orden de Aparición</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={editing.sortOrder ?? 0}
                      onChange={(e) => setEditing((prev: any) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Descripción Corta</label>
                  <input
                    className={inputCls}
                    value={editing.description ?? ''}
                    onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción descriptiva breve de la categoría"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <ImageUploader
                      value={editing.imageUrl ?? ''}
                      onChange={(url) => setEditing((prev) => ({ ...prev, imageUrl: url }))}
                      label="Imagen de Portada (R2)"
                      helpText="Recomendado: imagen de alta calidad, relación aspect 4:3 o 16:9."
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Texto Alt de la Imagen</label>
                      <input
                        className={inputCls}
                        value={editing.imageAlt ?? ''}
                        onChange={(e) => setEditing((prev) => ({ ...prev, imageAlt: e.target.value }))}
                        placeholder="Cacheteros negros de twerk"
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`edit-active-${editing.id}`}
                          checked={editing.isActive ?? false}
                          onChange={(e) => setEditing((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded border-white/10 bg-[#0f0f0f] text-brand-magenta focus:ring-0"
                        />
                        <label htmlFor={`edit-active-${editing.id}`} className="text-xs text-neutral-300 select-none cursor-pointer">
                          Tarjeta Activa (Visible en Home)
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`edit-highlight-${editing.id}`}
                          checked={editing.highlight ?? false}
                          onChange={(e) => setEditing((prev: any) => ({ ...prev, highlight: e.target.checked }))}
                          className="rounded border-white/10 bg-[#0f0f0f] text-brand-magenta focus:ring-0"
                        />
                        <label htmlFor={`edit-highlight-${editing.id}`} className="text-xs text-neutral-300 select-none cursor-pointer">
                          Destacar Tarjeta (Borde Magenta Glow + Icono)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!editing.imageUrl && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-[11px] text-amber-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Esta tarjeta no tiene una imagen cargada. Se mostrará un fallback visual.</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 text-[10px] font-display font-black tracking-widest bg-brand-magenta text-black px-4 py-2 rounded-lg hover:bg-brand-magenta/90 transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  SAVE CHANGES
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(null); setFormError(null); }}
                  className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> CANCEL
                </button>
              </div>
            </form>
          </td>
        </tr>
      );
    }

    return (
      <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5" key={c.id}>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.title} className="w-12 h-10 object-cover rounded-lg border border-white/5" />
            ) : (
              <div className="w-12 h-10 bg-neutral-800 rounded-lg border border-white/5 flex items-center justify-center text-[10px] text-neutral-500 font-mono">NO IMG</div>
            )}
            <div>
              <p className="text-xs font-semibold text-white uppercase">{c.title}</p>
              <p className="text-[10px] text-neutral-600 font-mono">{c.slug}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-xs text-neutral-400 hidden sm:table-cell">
          <span className="font-mono">{c.href}</span>
          <span className="block text-[10px] text-neutral-500 capitalize mt-0.5">Tipo: {c.linkType || 'category'}</span>
        </td>
        <td className="px-4 py-3.5 text-center hidden md:table-cell">
          <span className="text-xs font-mono font-bold">{c.sortOrder}</span>
        </td>
        <td className="px-4 py-3.5 text-center">
          <div className="flex flex-col items-center gap-1">
            {c.isActive ? (
              <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono font-bold">ACTIVO</span>
            ) : (
              <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">OCULTO</span>
            )}
            {c.highlight && (
              <span className="text-[8px] bg-brand-magenta/10 border border-brand-magenta/20 text-brand-magenta px-1.5 py-0.5 rounded font-mono font-bold tracking-widest">DESTACADO</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => { setEditing({ ...c }); setFormError(null); }}
              className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(c.id)}
              className="p-1.5 rounded-lg border border-white/10 text-neutral-500 hover:text-red-400 hover:border-red-500/20 transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase">El Arsenal</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            Administra las categorías de "Comprar por tipo" de la página principal // {cards.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowNew(true); setFormError(null); }}
            className="flex items-center gap-2 bg-brand-magenta text-black text-xs font-display font-black tracking-widest px-4 py-2.5 rounded-lg hover:bg-brand-magenta/90 transition-colors shadow-magenta-glow"
          >
            <Plus className="w-4 h-4" /> NUEVA TARJETA
          </button>
        </div>
      </div>

      {/* New Card inline form */}
      {showNew && (
        <div className="border border-brand-magenta/20 rounded-xl bg-brand-magenta/5 p-5">
          <h3 className="text-[10px] font-display font-black tracking-widest text-brand-magenta mb-4">
            NUEVA TARJETA DE PERFORMANCE
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Nombre Visible *</label>
                <input
                  className={inputCls}
                  required
                  value={newForm.title}
                  onChange={(e) =>
                    setNewForm((prev) => ({ ...prev, title: e.target.value, slug: slugify(e.target.value) }))
                  }
                  placeholder="CACHETEROS"
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Slug *</label>
                <input
                  className={inputCls}
                  required
                  value={newForm.slug}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="cacheteros"
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Link Destino (Href) *</label>
                <input
                  className={inputCls}
                  required
                  value={newForm.href}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, href: e.target.value }))}
                  placeholder="/tienda?category=cacheteros"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Tipo de Link *</label>
                <select
                  className={inputCls}
                  required
                  value={newForm.linkType ?? 'category'}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, linkType: e.target.value }))}
                >
                  <option value="category">Categoría (e.g. tienda?category=...)</option>
                  <option value="collection">Colección (e.g. colecciones/...)</option>
                  <option value="search">Búsqueda / Filtro</option>
                  <option value="offer">Oferta / Promoción</option>
                  <option value="external">URL Externa o Interna General</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Etiqueta de Badge</label>
                <input
                  className={inputCls}
                  value={newForm.badgeLabel ?? ''}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, badgeLabel: e.target.value }))}
                  placeholder="OFERTA, NUEVO, etc."
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Orden de Aparición</label>
                <input
                  type="number"
                  className={inputCls}
                  value={newForm.sortOrder}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Descripción Corta</label>
              <input
                className={inputCls}
                value={newForm.description ?? ''}
                onChange={(e) => setNewForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Diseñados para comodidad y movimiento…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <ImageUploader
                  value={newForm.imageUrl}
                  onChange={(url) => setNewForm((prev) => ({ ...prev, imageUrl: url }))}
                  label="Imagen de Portada (R2)"
                  helpText="Sube la imagen para la tarjeta de categoría."
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Texto Alt de Imagen</label>
                  <input
                    className={inputCls}
                    value={newForm.imageAlt ?? ''}
                    onChange={(e) => setNewForm((prev) => ({ ...prev, imageAlt: e.target.value }))}
                    placeholder="Colección de cacheteros"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-active"
                      checked={newForm.isActive}
                      onChange={(e) => setNewForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-white/10 bg-[#0f0f0f] text-brand-magenta focus:ring-0"
                    />
                    <label htmlFor="new-active" className="text-xs text-neutral-300 select-none cursor-pointer">
                      Tarjeta Activa (Visible en Home)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-highlight"
                      checked={newForm.highlight}
                      onChange={(e) => setNewForm((prev) => ({ ...prev, highlight: e.target.checked }))}
                      className="rounded border-white/10 bg-[#0f0f0f] text-brand-magenta focus:ring-0"
                    />
                    <label htmlFor="new-highlight" className="text-xs text-neutral-300 select-none cursor-pointer">
                      Destacar Tarjeta (Borde Magenta Glow + Icono)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 text-[10px] font-display font-black tracking-widest bg-brand-magenta text-black px-4 py-2 rounded-lg hover:bg-brand-magenta/90 transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                CREATE CARD
              </button>
              <button
                type="button"
                onClick={() => { setShowNew(false); setFormError(null); }}
                className="text-[10px] text-neutral-400 hover:text-white transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-brand-magenta animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-neutral-400">{error}</p>
          <button onClick={load} className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5">RETRY</button>
        </div>
      ) : cards.length === 0 && !showNew ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/10 rounded-xl">
          <p className="text-sm text-neutral-500">No merchandising cards yet.</p>
          <button
            onClick={() => setShowNew(true)}
            className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5"
          >
            CREATE FIRST CARD →
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                <th className="text-left px-4 py-3">TARJETA</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">LINK DE DESTINO (HREF)</th>
                <th className="text-center px-4 py-3 hidden md:table-cell">ORDEN</th>
                <th className="text-center px-4 py-3">ESTADO</th>
                <th className="text-right px-4 py-3">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cards.map((c) => renderCardRow(c))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
