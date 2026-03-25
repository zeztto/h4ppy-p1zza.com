import type { PublicProfile } from '@/app/lib/types';
import { Github, Instagram, Mail } from 'lucide-react';

interface FooterProps {
  profile?: PublicProfile;
}

export function Footer({ profile }: FooterProps) {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">h4ppy p1zza</span>
          <div className="flex items-center gap-4">
            {profile?.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-5" />
              </a>
            )}
            {profile?.instagramUrl && (
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="size-5" />
              </a>
            )}
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="size-5" />
              </a>
            )}
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 h4ppy p1zza
          </p>
        </div>
      </div>
    </footer>
  );
}
