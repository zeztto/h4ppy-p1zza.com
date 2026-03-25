import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeading } from '@/app/components/SectionHeading';
import { ProjectCard } from '@/app/components/ProjectCard';
import type { PublicProject } from '@/app/lib/types';
import type { ProjectsSectionContent } from '@/app/lib/section-content-types';
import { DEFAULT_PROJECTS_CONTENT } from '@/data/site-content';

interface ProjectsSectionProps {
  projects: PublicProject[];
  content?: ProjectsSectionContent;
}

export function ProjectsSection({ projects, content }: ProjectsSectionProps) {
  const data = content ?? DEFAULT_PROJECTS_CONTENT;

  const filtered = data.showFeaturedOnly
    ? projects.filter((p) => p.isFeatured)
    : projects;

  const displayed = filtered.slice(0, data.maxItems);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {displayed.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/portfolio/${p.id}`} className="block">
                <ProjectCard project={p} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
