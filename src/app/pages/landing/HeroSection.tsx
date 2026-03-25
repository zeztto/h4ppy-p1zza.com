import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import type { PublicProfile } from '@/app/lib/types';
import type { HeroContent } from '@/app/lib/section-content-types';
import { DEFAULT_HERO_CONTENT } from '@/data/site-content';

interface HeroSectionProps {
  profile: PublicProfile;
  content?: HeroContent;
}

export function HeroSection({ profile, content }: HeroSectionProps) {
  const heroData = content ?? DEFAULT_HERO_CONTENT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-foreground">
            {profile.displayName}
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            {profile.headline}
          </p>
          <p className="text-muted-foreground mt-6 max-w-lg">
            {profile.bioShort}
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link to={heroData.ctaLink}>{heroData.ctaText}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile">프로필</Link>
            </Button>
          </div>
        </div>
        {heroData.showAvatar && (
          <div className="flex-1 flex justify-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="rounded-2xl w-80 h-80 object-cover shadow-lg"
              />
            ) : (
              <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5" />
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
