'use client';

import React, { useRef, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Upload, Link as LinkIcon, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  helpText?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label,
  helpText,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSizeBytes) {
      setError('El archivo excede el tamaño máximo de 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await adminApi.collections.uploadImage(file);
      onChange(result.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message ?? 'Fallo al subir la imagen.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-2 p-4 border border-white/5 bg-brand-charcoal/30 rounded-xl">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-display font-bold tracking-widest text-neutral-400 uppercase">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-red-400 font-display font-bold uppercase transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preview and Upload Action Area */}
        <div className="relative aspect-[16/9] w-full rounded-lg border border-dashed border-white/10 overflow-hidden bg-brand-dark/50 flex flex-col items-center justify-center group transition-colors hover:border-white/20">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-black text-[10px] font-display font-black tracking-wider uppercase rounded hover:bg-neutral-200 transition-colors"
                >
                  Cambiar Imagen
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-4 space-y-2">
              {uploading ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Loader2 className="w-5 h-5 text-brand-magenta animate-spin" />
                  <span className="text-[10px] text-neutral-400 font-mono">SUBIENDO...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-neutral-600 mx-auto" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-brand-magenta hover:text-white font-display font-bold tracking-widest uppercase transition-colors"
                  >
                    Subir Imagen
                  </button>
                </>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Manual URL and Help text */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-500 font-display font-bold tracking-widest uppercase block">
              O PEGAR URL DIRECTA
            </span>
            <div className="relative">
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-magenta transition-colors placeholder:text-neutral-800"
                disabled={uploading}
              />
              <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
            </div>
          </div>

          {helpText && (
            <p className="text-[10px] text-neutral-500 italic leading-relaxed">
              {helpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
