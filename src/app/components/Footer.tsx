import { Link } from 'react-router-dom';
import type { PublicProfile } from '@/app/lib/types';
import { useSettings } from '@/app/hooks/useSettings';
import { Github, Instagram, Mail, Twitter, Linkedin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SocialLink {
  type: string;
  url: string;
  label?: string;
}

interface FooterSettings {
  siteName: string;
  copyright: string;
  socialLinks: SocialLink[];
}

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  siteName: 'h4ppy p1zza',
  copyright: '\u00A9 2026 h4ppy p1zza. All rights reserved.',
  socialLinks: [],
};

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  github: Github,
  instagram: Instagram,
  email: Mail,
  twitter: Twitter,
  linkedin: Linkedin,
};

interface FooterProps {
  profile?: PublicProfile;
}

export function Footer({ profile }: FooterProps) {
  const { data: footerSettings } = useSettings<FooterSettings>('footer', DEFAULT_FOOTER_SETTINGS);

  const socialLinks: SocialLink[] =
    footerSettings.socialLinks.length > 0
      ? footerSettings.socialLinks
      : buildProfileSocialLinks(profile);

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="space-y-3">
            <Link to="/" className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors">
              {footerSettings.siteName}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {profile?.bioShort ?? 'Web Developer & Creative Maker'}
            </p>
          </div>

          {/* Navigation column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Pages</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                Home
              </Link>
              <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                Portfolio
              </Link>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                Profile
              </Link>
            </nav>
          </div>

          {/* Social column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICON_MAP[link.type];
                if (!Icon) return null;
                const href = link.type === 'email' ? `mailto:${link.url}` : link.url;
                return (
                  <a
                    key={link.type}
                    href={href}
                    target={link.type === 'email' ? undefined : '_blank'}
                    rel={link.type === 'email' ? undefined : 'noopener noreferrer'}
                    aria-label={link.label ?? link.type}
                    className="flex items-center justify-center size-9 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 py-6">
          <p className="text-xs text-muted-foreground">
            {footerSettings.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

function buildProfileSocialLinks(profile?: PublicProfile): SocialLink[] {
  const links: SocialLink[] = [];
  if (profile?.githubUrl) {
    links.push({ type: 'github', url: profile.githubUrl, label: 'GitHub' });
  }
  if (profile?.instagramUrl) {
    links.push({ type: 'instagram', url: profile.instagramUrl, label: 'Instagram' });
  }
  if (profile?.email) {
    links.push({ type: 'email', url: profile.email, label: 'Email' });
  }
  return links;
}
