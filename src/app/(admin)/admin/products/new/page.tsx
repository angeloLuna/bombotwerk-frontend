'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminCollection } from '@/types/admin';
import { defaultProductForm } from '@/types/admin';
import ProductFormComponent from '../_components/ProductFormComponent';
import { Loader2 } from 'lucide-react';

export default function NewProductPage() {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.collections
      .list()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-brand-magenta animate-spin" />
      </div>
    );
  }

  return (
    <ProductFormComponent
      heading="New Product"
      initialValues={defaultProductForm()}
      collections={collections}
    />
  );
}
