import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Footer } from '@/app/components/Footer';
import { EditModeProvider } from '@/app/components/inline-edit/EditModeProvider';
import { EditModeFAB } from '@/app/components/inline-edit/EditModeFAB';
import { EditableWrapper } from '@/app/components/inline-edit/EditableWrapper';
import { usePublicData } from '@/app/hooks/usePublicData';
import { useSettings } from '@/app/hooks/useSettings';
import type { PublicProfile } from '@/app/lib/types';
import { DEFAULT_SITE_PROFILE } from '@/data/site-content';

interface HeaderSettings {
  siteName: string;
  navLinks: Array<{ label: string; to: string }>;
  showThemeToggle: boolean;
}

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  siteName: 'p1zza.kr',
  navLinks: [
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Profile', to: '/profile' },
  ],
  showThemeToggle: true,
};

const fallbackProfile: PublicProfile = {
  ...DEFAULT_SITE_PROFILE,
  id: 'primary',
  email: DEFAULT_SITE_PROFILE.email ?? '',
  updatedAt: '',
};

function NavLink({ to, label, isActive }: { to: string; label: string; isActive: boolean }) {
  return (
    <Link
      to={to}
      className={`relative py-1 text-sm font-medium transition-colors ${
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      {isActive && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-primary rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { data: profile } = usePublicData<PublicProfile>('profile', fallbackProfile);
  const { data: headerSettings } = useSettings<HeaderSettings>('header', DEFAULT_HEADER_SETTINGS);

  // Close mobile menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  const isLinkActive = (to: string) =>
    pathname === to || pathname.startsWith(to + '/');

  return (
    <EditModeProvider>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Left: Site name */}
            <EditableWrapper onEdit={() => { /* placeholder: open header editor */ }}>
              <Link to="/" className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors">
                {headerSettings.siteName}
              </Link>
            </EditableWrapper>

            {/* Right: Desktop nav */}
            <EditableWrapper onEdit={() => { /* placeholder: open header editor */ }}>
              <nav className="hidden md:flex items-center gap-8">
                {headerSettings.navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    isActive={isLinkActive(link.to)}
                  />
                ))}
                {headerSettings.showThemeToggle && (
                  <div className="ml-2">
                    <ThemeToggle />
                  </div>
                )}
              </nav>
            </EditableWrapper>

            {/* Right: Mobile hamburger + theme toggle */}
            <div className="flex items-center gap-2 md:hidden">
              {headerSettings.showThemeToggle && <ThemeToggle />}
              <button
                className="text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-border/50 bg-background md:hidden"
              >
                <div className="px-6 py-4 flex flex-col gap-1">
                  {headerSettings.navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isLinkActive(link.to)
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <EditableWrapper onEdit={() => { /* placeholder: open footer editor */ }}>
          {profile ? <Footer profile={profile} /> : <Footer />}
        </EditableWrapper>
      </div>

      <EditModeFAB />
    </EditModeProvider>
  );
}
