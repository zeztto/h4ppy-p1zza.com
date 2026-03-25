import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeading } from '@/app/components/SectionHeading';
import { ProjectCard } from '@/app/components/ProjectCard';
import { useSettings } from '@/app/hooks/useSettings';
import type { PublicProject } from '@/app/lib/types';
import type { ProjectsSectionContent } from '@/app/lib/section-content-types';
import { DEFAULT_PROJECTS_CONTENT } from '@/data/site-content';

const gridColsClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

interface ProjectsSectionProps {
  projects: PublicProject[];
  content?: ProjectsSectionContent;
}

export function ProjectsSection({ projects, content }: ProjectsSectionProps) {
  const data = content ?? DEFAULT_PROJECTS_CONTENT;
  const { data: gridSettings } = useSettings<{ landingColumns: number; portfolioPageColumns: number }>(
    'portfolio_grid',
    { landingColumns: 3, portfolioPageColumns: 3 },
  );
  const columns = gridSettings.landingColumns;
  const gridClass = gridColsClass[columns] ?? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const filtered = data.showFeaturedOnly
    ? projects.filter((p) => p.isFeatured)
    : projects;

  const displayed = data.showFeaturedOnly
    ? filtered
    : filtered.slice(0, data.maxItems);

  if (displayed.length === 0) return null;

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          title={data.title}
          action={
            <Link
              to="/portfolio"
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              전체 보기 →
            </Link>
          }
        />
        <div className={`grid ${gridClass} gap-6 mt-8`}>
          {displayed.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Link to={`/portfolio/${p.id}`} className="block h-full">
                <ProjectCard project={p} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
