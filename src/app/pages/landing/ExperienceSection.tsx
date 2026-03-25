import { motion } from 'motion/react';
import { SectionHeading } from '@/app/components/SectionHeading';
import type { ExperienceContent } from '@/app/lib/section-content-types';
import { DEFAULT_EXPERIENCE_CONTENT } from '@/data/site-content';

interface ExperienceSectionProps {
  content?: ExperienceContent;
}

export function ExperienceSection({ content }: ExperienceSectionProps) {
  const data = content ?? DEFAULT_EXPERIENCE_CONTENT;

  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={data.title} />
        <div className="border-l-2 border-border mt-8 space-y-10">
          {data.items.map((milestone, index) => (
            <motion.div
              key={milestone.title}
              className="pl-8 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-primary -translate-x-1.5" />
              <h3 className="text-lg font-semibold text-foreground">
                {milestone.title}
              </h3>
              <p className="text-muted-foreground mt-1">
                {milestone.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
