import type { LucideIcon } from 'lucide-react';
import * as icons from 'lucide-react';
import { SectionHeading } from '@/app/components/SectionHeading';
import type { ValuesContent } from '@/app/lib/section-content-types';
import { DEFAULT_VALUES_CONTENT } from '@/data/site-content';

function getIcon(name: string): LucideIcon {
  return (icons as unknown as Record<string, LucideIcon>)[name] ?? icons.HelpCircle;
}

interface ValuesSectionProps {
  content?: ValuesContent;
}

export function ValuesSection({ content }: ValuesSectionProps) {
  const data = content ?? DEFAULT_VALUES_CONTENT;

  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title={data.title} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {data.items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div key={item.title}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                <p className="text-muted-foreground mt-2">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
