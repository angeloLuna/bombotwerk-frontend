'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCollections } from '@/lib/api';
import type { ApiCollection } from '@/types/api';
import Section from '@/components/ui/Section';
import CollectionCard from '@/components/ui/CollectionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { ArrowRight, Sparkles, Flame, ShieldAlert, Instagram } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load collections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Mood nav items derived from real collection slugs (or static fallback)
  const moodLinks = collections.length > 0
    ? collections.map((c) => ({
        title: c.name,
        desc: c.tagline ?? 'BROWSE COLLECTION',
        path: `/collections/${c.slug}`,
      }))
    : [
        { title: 'SAVAGE ENERGY', desc: 'HIGH-INTENSITY VIBES', path: '/collections/latin-pulse' },
        { title: 'CLUB GLOW', desc: 'NEON LIT REFLECTIVES', path: '/collections/nocturnal-pulse' },
        { title: 'STUDIO VIBES', desc: 'SENSORY PERFORMANCEWEAR', path: '/collections/velvet-motion' },
      ];

  return (
    <div className="w-full bg-brand-dark pb-24 md:pb-12">

      {/* Editorial Header */}
      <section className="pt-12 pb-6 px-4 text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> ARCHIVE & DROPS
        </span>
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase">
          SHOP THE <br />
          <span className="italic font-normal text-brand-magenta text-glow-magenta">SILHOUETTES</span>
        </h1>
        <div className="w-10 h-[1px] bg-brand-magenta/60 mx-auto mt-4" />
      </section>

      {/* 1. COLLECTIONS GRID (BANNER STYLES) */}
      <section className="px-4 md:px-8 py-10 max-w-5xl mx-auto space-y-12">
        {loading ? (
          <LoadingSpinner message="LOADING DROPS..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCollections} />
        ) : collections.length === 0 ? (
          <EmptyState
            title="NO DROPS YET"
            message="New collections are being crafted in CDMX. Check back soon."
          />
        ) : (
          collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant="banner"
              className="rounded-2xl overflow-hidden"
            />
          ))
        )}
      </section>

      {/* 2. THE PHILOSOPHY STORY */}
      <Section
        title="UNAPOLOGETIC MOVEMENT"
        subtitle="THE PHILOSOPHY"
        bg="charcoal"
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-base md:text-lg text-neutral-300 font-sans font-light leading-relaxed tracking-wide">
            Designed for the women who own the night. Our performancewear doesn&apos;t just support your rhythm; it amplifies it. From the studio to the club, Bombo is your second skin, engineered to express confidence and power.
          </p>
          <div className="flex justify-center items-center gap-3 text-brand-magenta font-display font-black text-xs tracking-widest pt-2">
            <Flame className="w-4 h-4 text-brand-magenta animate-pulse" />
            <span>BUILT FOR THE SPOTLIGHT</span>
          </div>
        </div>
      </Section>

      {/* 3. SHOP THE MOOD / CATEGORIES */}
      <Section
        title="SHOP THE MOOD"
        subtitle="CATEGORIES"
        bg="dark"
      >
        <div className="max-w-xl mx-auto divide-y divide-white/5 border-t border-b border-white/5">
          {moodLinks.map((mood) => (
            <Link
              key={mood.title}
              href={mood.path}
              className="flex justify-between items-center py-6 group hover:px-2 transition-all duration-300"
            >
              <div className="space-y-1">
                <span className="font-display font-black text-lg tracking-wider text-white group-hover:text-brand-magenta transition-colors">
                  {mood.title}
                </span>
                <p className="text-[10px] text-neutral-500 tracking-widest">{mood.desc}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-brand-magenta group-hover:bg-brand-magenta/10 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-magenta transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* 4. SOCIAL PROOF VIDEO SECTION */}
      <Section
        title="SEEN ON MOVEMENT"
        subtitle="LIVE FROM SESSION HQ"
        bg="plum"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=300', class: 'Waacking class' },
            { img: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=300', class: 'Heels session' },
            { img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=300', class: 'Pole workout' },
            { img: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=300', class: 'Atelier fitting' },
          ].map((item, idx) => (
            <div key={idx} className="relative aspect-[9/16] border border-white/5 overflow-hidden group rounded-xl">
              <img src={item.img} alt={item.class} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left space-y-1">
                <span className="bg-brand-magenta text-black font-black text-[8px] px-1.5 py-0.5 rounded">LIVE</span>
                <p className="text-[10px] text-white font-bold tracking-wider">{item.class}</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-4 h-4 text-brand-magenta" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
