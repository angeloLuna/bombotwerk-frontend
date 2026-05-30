'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Package,
  Layers,
  ShoppingBag,
  Menu,
  X,
  Zap,
  ChevronRight,
  LogOut,
} from 'lucide-react';


const NAV: Array<{
  label: string;
  href: string;
  icon: any;
  disabled?: boolean;
}> = [
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Collections', href: '/admin/collections', icon: Layers },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
];



function Sidebar({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/admin/products" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-brand-magenta rounded flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="block text-[10px] font-display font-black tracking-widest text-brand-magenta">
              BOMBO TWERK
            </span>
            <span className="block text-[9px] text-neutral-500 tracking-widest uppercase">
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ label, href, icon: Icon, disabled }) => {
          const active = pathname.startsWith(href);
          if (disabled) {
            return (
              <div
                key={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 cursor-not-allowed select-none"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-display font-bold tracking-wider">{label}</span>
                <span className="ml-auto text-[9px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded tracking-wider">
                  SOON
                </span>
              </div>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                active
                  ? 'bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-display font-bold tracking-wider">{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5">
        <Link
          href="/"
          className="text-[10px] text-neutral-500 hover:text-brand-magenta transition-colors tracking-widest font-display"
        >
          ← VIEW STOREFRONT
        </Link>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#111111] border-r border-white/5 fixed left-0 top-0 h-screen z-40">
        <Sidebar pathname={pathname} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#111111] border-r border-white/5 z-50 transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar pathname={pathname} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/5 px-4 md:px-8 py-3 flex items-center gap-4">
          <button
            className="md:hidden text-neutral-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          
          {session?.user && (
            <div className="flex items-center gap-4 text-xs">
              {/* User profile */}
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-5 h-5 rounded-full border border-white/10"
                  />
                )}
                <span className="text-neutral-400 font-sans hidden sm:inline">
                  {session.user.name || session.user.email}
                </span>
                <span className="text-[8px] bg-brand-magenta/10 text-brand-magenta px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                  {session.user.role}
                </span>
              </div>

              {/* Logout action */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-1 text-neutral-500 hover:text-red-400 transition-colors font-display font-bold tracking-widest text-[9px]"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">CERRAR SESIÓN</span>
              </button>
            </div>
          )}
        </header>


        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
