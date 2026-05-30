'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminCollection, AdminProduct } from '@/types/admin';
import { productToForm } from '@/types/admin';
import ProductFormComponent from '../../_components/ProductFormComponent';
import { Loader2, XCircle } from 'lucide-react';

interface EditProductPageProps {
  params: any;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [id, setId] = useState<string>(() => {
    if (params && typeof (params as any).then !== 'function') {
      return (params as any).id || '';
    }
    return '';
  });

  useEffect(() => {
    if (params && typeof (params as any).then === 'function') {
      (params as any).then((resolvedParams: any) => {
        if (resolvedParams?.id) {
          setId(resolvedParams.id);
        }
      });
    } else if (params && (params as any).id) {
      setId((params as any).id);
    }
  }, [params]);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([adminApi.products.get(id), adminApi.collections.list()])
      .then(([p, cols]) => {
        setProduct(p);
        setCollections(cols);
      })
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-brand-magenta animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <XCircle className="w-8 h-8 text-brand-magenta" />
        <p className="text-sm text-neutral-400">{error ?? 'Product not found'}</p>
      </div>
    );
  }

  return (
    <ProductFormComponent
      heading={`Edit: ${product.name}`}
      initialValues={productToForm(product)}
      collections={collections}
      productId={product.id}
    />
  );
}
