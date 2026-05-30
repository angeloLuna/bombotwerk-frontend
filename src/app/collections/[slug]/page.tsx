'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCollectionBySlug } from '@/lib/api';
import type { ApiCollection } from '@/types/api';
import Section from '@/components/ui/Section';
import ProductCard from '@/components/ui/ProductCard';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CollectionPageProps {
  params: any;
}

export default function CollectionDetailPage({ params }: CollectionPageProps) {
  const [slug, setSlug] = useState<string>(() => {
    if (params && typeof (params as any).then !== 'function') {
      return (params as any).slug || '';
    }
    return '';
  });

  useEffect(() => {
    if (params && typeof (params as any).then === 'function') {
      (params as any).then((resolvedParams: any) => {
        if (resolvedParams?.slug) {
          setSlug(resolvedParams.slug);
        }
      });
    } else if (params && (params as any).slug) {
      setSlug((params as any).slug);
    }
  }, [params]);

  const [collection, setCollection] = useState<ApiCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchCollection = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getCollectionBySlug(slug);
      setCollection(data);
    } catch (e: any) {
      const msg: string = e?.message ?? '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setNotFound(true);
      } else {
        setError(msg || 'Failed to load collection.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  if (loading) {
    return (
      <div className="w-full bg-brand-dark pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <Link href="/collections" className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors">
            <ArrowLeft className="w-4 h-4" /> BACK TO ALL DROPS
          </Link>
        </div>
        <LoadingSpinner message="LOADING COLLECTION..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <h1 className="font-serif text-3xl text-neutral-400">COLLECTION NOT FOUND</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          The editorial drop you are looking for has been archived or does not exist.
        </p>
        <Link href="/collections" className="text-brand-magenta text-xs tracking-widest font-display font-black border-b border-brand-magenta pb-1">
          VIEW ALL ACTIVE DROPS
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-brand-dark pb-24">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <Link href="/collections" className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors">
            <ArrowLeft className="w-4 h-4" /> BACK TO ALL DROPS
          </Link>
        </div>
        <ErrorState
          message={error}
          onRetry={fetchCollection}
          actionLabel="VIEW ALL DROPS"
          actionHref="/collections"
        />
      </div>
    );
  }

  if (!collection) return null;

  const products = collection.products ?? [];

  return (
    <div className="w-full bg-brand-dark pb-24 md:pb-12">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO ALL DROPS
        </Link>
      </div>

      {/* Collection Headline Section */}
      <section className="pt-8 pb-12 px-4 text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> CURRENT DROP
        </span>
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase">
          {collection.name}
        </h1>
        {collection.tagline && (
          <p className="text-sm text-neutral-300 font-sans font-light max-w-xl mx-auto leading-relaxed tracking-wide italic">
            &ldquo;{collection.tagline}&rdquo;
          </p>
        )}
        {collection.description && (
          <p className="text-xs md:text-sm text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed tracking-wide pt-2">
            {collection.description}
          </p>
        )}
        <div className="w-12 h-[1px] bg-brand-magenta/60 mx-auto mt-6" />
      </section>

      {/* Products list */}
      <section className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
        {products.length === 0 ? (
          <EmptyState
            title="NO ITEMS IN THIS DROP"
            message="No items currently available in this collection."
            actionLabel="BROWSE ALL DROPS"
            actionHref="/collections"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Stylist Assist Footer */}
      <section className="max-w-xl mx-auto px-4 pt-16">
        <WhatsAppAssist
          text="Need help finding the right outfit or size in this drop?"
          linkText="Stylist Chat"
        />
      </section>
    </div>
  );
}
