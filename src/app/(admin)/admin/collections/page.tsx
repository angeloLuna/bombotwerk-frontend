'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminCollection } from '@/types/admin';
import { Plus, Pencil, Check, X, Loader2, RefreshCw } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';
import SeoFieldsGroup from '../_components/SeoFieldsGroup';

type EditState = Partial<AdminCollection> & { id?: string };

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMPTY_FORM: Omit<AdminCollection, 'id' | '_count'> = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  bgImage: '',
  coverImageUrl: '',
  heroImageUrl: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  imageAltText: '',
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
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
      setCollections(await adminApi.collections.list());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Create ────────────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await adminApi.collections.create(newForm);
      setCollections((prev) => [...prev, created]);
      setShowNew(false);
      setNewForm({ ...EMPTY_FORM });
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to create');
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
      const { id, _count, createdAt, updatedAt, ...body } = editing;
      const updated = await adminApi.collections.update(id, body);
      setCollections((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setEditing(null);
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  // ── Form rows ─────────────────────────────────────────────────────────────

  const inputCls =
    'bg-[#0f0f0f] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-magenta transition-colors w-full';

  function renderCollectionRow(c: AdminCollection) {
    const isEditing = editing?.id === c.id;

    if (isEditing) {
      return (
        <tr className="bg-brand-magenta/5" key={c.id}>
          <td className="px-4 py-3" colSpan={5}>
            <form onSubmit={handleUpdate} className="space-y-3">
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                  {formError}
                </p>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Name *</label>
                    <input
                      className={inputCls}
                      required
                      value={editing.name ?? ''}
                      onChange={(e) => {
                        setEditing((prev) => ({
                          ...prev,
                          name: e.target.value,
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
                    <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Tagline</label>
                    <input
                      className={inputCls}
                      value={editing.tagline ?? ''}
                      onChange={(e) => setEditing((prev) => ({ ...prev, tagline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploader
                    value={editing.coverImageUrl ?? ''}
                    onChange={(url) => setEditing((prev) => ({ ...prev, coverImageUrl: url }))}
                    label="Imagen de Portada (Cards)"
                    helpText="Recomendado: imagen cuadrada o vertical, ideal para tarjetas."
                  />
                  <ImageUploader
                    value={editing.heroImageUrl ?? ''}
                    onChange={(url) => setEditing((prev) => ({ ...prev, heroImageUrl: url }))}
                    label="Imagen de Banner (Hero)"
                    helpText="Recomendado: imagen horizontal 16:9, ideal para cabeceras."
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">
                    Imagen de Fallback Legacy (BG Image URL)
                  </label>
                  <input
                    type="url"
                    className={inputCls}
                    value={editing.bgImage ?? ''}
                    onChange={(e) => setEditing((prev) => ({ ...prev, bgImage: e.target.value }))}
                  />
                </div>
              </div>

              {(!editing.seoDescription || !(editing.coverImageUrl || editing.heroImageUrl || editing.bgImage)) && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-[11px] text-amber-500 space-y-1">
                  <p className="font-bold">Advertencias de SEO no bloqueantes:</p>
                  <ul className="list-disc list-inside space-y-0.5 font-sans">
                    {!editing.seoDescription && <li>Esta colección está publicada pero no tiene SEO description.</li>}
                    {!(editing.coverImageUrl || editing.heroImageUrl || editing.bgImage) && <li>Esta colección está publicada pero no tiene imagen principal.</li>}
                  </ul>
                </div>
              )}

              <SeoFieldsGroup
                seoTitle={editing.seoTitle ?? ''}
                seoDescription={editing.seoDescription ?? ''}
                seoKeywords={editing.seoKeywords ?? ''}
                extraField={{
                  name: 'imageAltText',
                  label: 'Texto Alternativo de Imagen (imageAltText)',
                  placeholder: 'Colección de twerk en CDMX',
                  value: editing.imageAltText ?? '',
                  onChange: (val) => setEditing((prev: any) => ({ ...prev, imageAltText: val })),
                }}
                onChangeTitle={(val) => setEditing((prev: any) => ({ ...prev, seoTitle: val }))}
                onChangeDescription={(val) => setEditing((prev: any) => ({ ...prev, seoDescription: val }))}
                onChangeKeywords={(val) => setEditing((prev: any) => ({ ...prev, seoKeywords: val }))}
                defaultSlug={editing.slug ?? ''}
                previewPrefix="colecciones"
                fallbackName={editing.name ?? ''}
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 text-[10px] font-display font-black tracking-widest bg-brand-magenta text-black px-3 py-1.5 rounded hover:bg-brand-magenta/90 transition-colors"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(null); setFormError(null); }}
                  className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" /> CANCEL
                </button>
              </div>
            </form>
          </td>
        </tr>
      );
    }

    return (
      <tr className="hover:bg-white/[0.02] transition-colors group" key={c.id}>
        <td className="px-4 py-3.5">
          <p className="text-xs font-semibold text-white">{c.name}</p>
          <p className="text-[10px] text-neutral-600 font-mono mt-0.5">{c.slug}</p>
        </td>
        <td className="px-4 py-3.5 hidden md:table-cell">
          <span className="text-xs text-neutral-400">{c.tagline ?? '—'}</span>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell text-center">
          <span className="text-xs text-neutral-400">{c._count?.products ?? 0}</span>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <div className="flex flex-col gap-1 text-[10px] font-mono">
            {c.coverImageUrl && (
              <span className="text-green-400 truncate max-w-[150px]" title={c.coverImageUrl}>
                Cover: {c.coverImageUrl.substring(c.coverImageUrl.lastIndexOf('/') + 1)}
              </span>
            )}
            {c.heroImageUrl && (
              <span className="text-blue-400 truncate max-w-[150px]" title={c.heroImageUrl}>
                Hero: {c.heroImageUrl.substring(c.heroImageUrl.lastIndexOf('/') + 1)}
              </span>
            )}
            {c.bgImage && (
              <span className="text-neutral-500 truncate max-w-[150px]" title={c.bgImage}>
                Legacy: {c.bgImage.substring(c.bgImage.lastIndexOf('/') + 1)}
              </span>
            )}
            {!c.coverImageUrl && !c.heroImageUrl && !c.bgImage && (
              <span className="text-neutral-700">—</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3.5 text-right">
          <button
            onClick={() => { setEditing({ ...c }); setFormError(null); }}
            className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Collections</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            {collections.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowNew(true); setFormError(null); }}
            className="flex items-center gap-2 bg-brand-magenta text-black text-xs font-display font-black tracking-widest px-4 py-2.5 rounded-lg hover:bg-brand-magenta/90 transition-colors shadow-magenta-glow"
          >
            <Plus className="w-4 h-4" /> NEW COLLECTION
          </button>
        </div>
      </div>

      {/* New Collection inline form */}
      {showNew && (
        <div className="border border-brand-magenta/20 rounded-xl bg-brand-magenta/5 p-5">
          <h3 className="text-[10px] font-display font-black tracking-widest text-brand-magenta mb-4">
            NEW COLLECTION
          </h3>
          <form onSubmit={handleCreate} className="space-y-3">
            {formError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Name *</label>
                <input
                  className={inputCls}
                  required
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm((prev) => ({ ...prev, name: e.target.value, slug: slugify(e.target.value) }))
                  }
                  placeholder="LATIN PULSE"
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Slug *</label>
                <input
                  className={inputCls}
                  required
                  value={newForm.slug}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="latin-pulse"
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Tagline</label>
                <input
                  className={inputCls}
                  value={newForm.tagline ?? ''}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="RHYTHM OF THE NIGHT"
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">Description</label>
                <input
                  className={inputCls}
                  value={newForm.description ?? ''}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Collection description…"
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploader
                    value={newForm.coverImageUrl ?? ''}
                    onChange={(url) => setNewForm((prev) => ({ ...prev, coverImageUrl: url }))}
                    label="Imagen de Portada (Cards)"
                    helpText="Recomendado: imagen cuadrada o vertical, ideal para tarjetas."
                  />
                  <ImageUploader
                    value={newForm.heroImageUrl ?? ''}
                    onChange={(url) => setNewForm((prev) => ({ ...prev, heroImageUrl: url }))}
                    label="Imagen de Banner (Hero)"
                    helpText="Recomendado: imagen horizontal 16:9, ideal para cabeceras."
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <label className="text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">
                    Imagen de Fallback Legacy (BG Image URL)
                  </label>
                  <input
                    type="url"
                    className={inputCls}
                    value={newForm.bgImage ?? ''}
                    onChange={(e) => setNewForm((prev) => ({ ...prev, bgImage: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {(!newForm.seoDescription || !(newForm.coverImageUrl || newForm.heroImageUrl || newForm.bgImage)) && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-[11px] text-amber-500 space-y-1">
                <p className="font-bold">Advertencias de SEO no bloqueantes:</p>
                <ul className="list-disc list-inside space-y-0.5 font-sans">
                  {!newForm.seoDescription && <li>Esta colección está publicada pero no tiene SEO description.</li>}
                  {!(newForm.coverImageUrl || newForm.heroImageUrl || newForm.bgImage) && <li>Esta colección está publicada pero no tiene imagen principal.</li>}
                </ul>
              </div>
            )}

            <SeoFieldsGroup
              seoTitle={newForm.seoTitle ?? ''}
              seoDescription={newForm.seoDescription ?? ''}
              seoKeywords={newForm.seoKeywords ?? ''}
              extraField={{
                name: 'imageAltText',
                label: 'Texto Alternativo de Imagen (imageAltText)',
                placeholder: 'Colección de twerk en CDMX',
                value: newForm.imageAltText ?? '',
                onChange: (val) => setNewForm((prev) => ({ ...prev, imageAltText: val })),
              }}
              onChangeTitle={(val) => setNewForm((prev) => ({ ...prev, seoTitle: val }))}
              onChangeDescription={(val) => setNewForm((prev) => ({ ...prev, seoDescription: val }))}
              onChangeKeywords={(val) => setNewForm((prev) => ({ ...prev, seoKeywords: val }))}
              defaultSlug={newForm.slug ?? ''}
              previewPrefix="colecciones"
              fallbackName={newForm.name ?? ''}
            />

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 text-[10px] font-display font-black tracking-widest bg-brand-magenta text-black px-4 py-2 rounded-lg hover:bg-brand-magenta/90 transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3 h-3" />}
                CREATE
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
      ) : collections.length === 0 && !showNew ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-white/10 rounded-xl">
          <p className="text-sm text-neutral-500">No collections yet.</p>
          <button
            onClick={() => setShowNew(true)}
            className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5"
          >
            CREATE FIRST COLLECTION →
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                <th className="text-left px-4 py-3">NAME</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">TAGLINE</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">PRODUCTS</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">BG IMAGE</th>
                <th className="text-right px-4 py-3">EDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {collections.map((c) => renderCollectionRow(c))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
