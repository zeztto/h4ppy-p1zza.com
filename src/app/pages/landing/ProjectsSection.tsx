import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeading } from '@/app/components/SectionHeading';
import { ProjectCard } from '@/app/components/ProjectCard';
import type { PublicProject } from '@/app/lib/types';

interface ProjectsSectionProps {
  projects: PublicProject[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const featured = projects.filter((p) => p.isFeatured);

  if (featured.length === 0) return null;

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          title="Featured Projects"
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
          {featured.map((p, index) => (
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
