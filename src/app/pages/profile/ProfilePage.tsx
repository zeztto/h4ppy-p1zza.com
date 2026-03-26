import { motion } from 'motion/react';
import { Github, Instagram, Mail } from 'lucide-react';
import { usePublicData } from '@/app/hooks/usePublicData';
import type { PublicProfile } from '@/app/lib/types';
import { DEFAULT_SITE_PROFILE } from '@/data/site-content';

const profileFallback: PublicProfile = {
  ...DEFAULT_SITE_PROFILE,
  id: 'primary',
  updatedAt: '',
  email: DEFAULT_SITE_PROFILE.email ?? '',
};

export function ProfilePage() {
  const { data: profile, loading, error } = usePublicData<PublicProfile>(
    'profile',
    profileFallback,
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded mt-6 animate-pulse" />
        <div className="h-5 w-64 bg-muted rounded mt-2 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const p = profile ?? profileFallback;

  const sections = p.essayMarkdown.split('\n## ');
  const intro = sections[0] ?? '';
  const namedSections = sections.slice(1).map((s) => {
    const [title = '', ...body] = s.split('\n');
    return { title: title.trim(), body: body.join('\n').trim() };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-6 py-24"
    >
      <div className="text-center">
        {p.avatarUrl ? (
          <img
            src={p.avatarUrl}
            alt={p.displayName}
            className="w-32 h-32 rounded-full mx-auto object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-primary/30 to-primary/5" />
        )}
        <h1 className="text-3xl font-bold text-center mt-6">{p.displayName}</h1>
        <p className="text-lg text-muted-foreground text-center mt-2">
          {p.headline}
        </p>
        <p className="text-center mt-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            쓰리더블유(ThreeW) 소속
          </span>
        </p>
        <div className="flex justify-center gap-4 mt-4">
          {p.githubUrl && (
            <a
              href={p.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
          {p.instagramUrl && (
            <a
              href={p.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {p.email && (
            <a
              href={`mailto:${p.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <hr className="my-12 border-border" />

      <div>
        {intro
          .split('\n\n')
          .filter(Boolean)
          .map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}

        {namedSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-2xl font-semibold mt-12 mb-4">{section.title}</h2>
            {section.body
              .split('\n\n')
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
