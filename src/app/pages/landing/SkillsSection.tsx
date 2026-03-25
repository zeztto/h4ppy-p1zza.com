import { Badge } from '@/app/components/ui/badge';
import { SectionHeading } from '@/app/components/SectionHeading';
import type { SkillsContent } from '@/app/lib/section-content-types';
import { DEFAULT_SKILLS_CONTENT } from '@/data/site-content';

interface SkillsSectionProps {
  content?: SkillsContent;
}

export function SkillsSection({ content }: SkillsSectionProps) {
  const data = content ?? DEFAULT_SKILLS_CONTENT;

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={data.title} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {data.categories.map((group) => (
            <div key={group.name}>
              <h3 className="font-semibold text-foreground mb-3">
                {group.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
