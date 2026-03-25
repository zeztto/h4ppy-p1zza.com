import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Footer } from '@/app/components/Footer';
import { usePublicData } from '@/app/hooks/usePublicData';
import type { PublicProfile } from '@/app/lib/types';
import { DEFAULT_SITE_PROFILE } from '@/data/site-content';

const NAV_LINKS = [
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Profile', to: '/profile' },
];

const fallbackProfile: PublicProfile = {
  ...DEFAULT_SITE_PROFILE,
  id: 'primary',
  email: DEFAULT_SITE_PROFILE.email ?? '',
  updatedAt: '',
};

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { data: profile } = usePublicData<PublicProfile>('profile', fallbackProfile);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Site name */}
          <Link to="/" className="text-lg font-semibold text-foreground">
            h4ppy p1zza
          </Link>

          {/* Right: Desktop nav */}
          <nav className="hidden md:flex gap-6 items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  pathname === link.to || pathname.startsWith(link.to + '/')
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          {/* Right: Mobile hamburger */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile dropdown panel */}
        {isMenuOpen && (
          <nav className="absolute top-16 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  pathname === link.to || pathname.startsWith(link.to + '/')
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {profile ? <Footer profile={profile} /> : <Footer />}
    </div>
  );
}
