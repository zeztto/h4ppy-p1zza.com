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
  copyright: '\u00A9 2026 h4ppy p1zza',
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

  // Build social links: use settings if non-empty, otherwise fall back to profile
  const socialLinks: SocialLink[] =
    footerSettings.socialLinks.length > 0
      ? footerSettings.socialLinks
      : buildProfileSocialLinks(profile);

  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{footerSettings.siteName}</span>
          <div className="flex items-center gap-4">
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
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
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
