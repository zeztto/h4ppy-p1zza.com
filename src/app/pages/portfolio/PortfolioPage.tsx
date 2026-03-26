import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Github } from 'lucide-react';
import { usePublicData } from '@/app/hooks/usePublicData';
import { useSettings } from '@/app/hooks/useSettings';
import type { PublicProject } from '@/app/lib/types';
import { ProjectCard } from '@/app/components/ProjectCard';
import { Button } from '@/app/components/ui/button';
import { sortPortfolioProjects } from '@/app/lib/project-order';

const gridColsClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export function PortfolioPage() {
  const { data: projects, loading, error } = usePublicData<PublicProject[]>('projects');
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: gridSettings } = useSettings<{ landingColumns: number; portfolioPageColumns: number }>(
    'portfolio_grid',
    { landingColumns: 3, portfolioPageColumns: 3 },
  );
  const columns = gridSettings.portfolioPageColumns;
  const gridClass = gridColsClass[columns] ?? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="flex gap-2 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
        <div className={`grid ${gridClass} gap-6 mt-8`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const allProjects = sortPortfolioProjects(projects ?? []);
  const categories = [
    'All',
    ...new Set(allProjects.map((p) => p.category).filter(Boolean)),
  ];
  const filtered =
    activeFilter === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === activeFilter);

  if (allProjects.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold">Projects</h1>
        <p className="text-muted-foreground text-center mt-16">
          아직 프로젝트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold">Projects</h1>

      <div className="flex flex-wrap gap-2 mt-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFilter === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div layout className={`grid ${gridClass} gap-6 mt-8`}>
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="relative h-full">
                <Link
                  to={`/portfolio/${p.id}`}
                  aria-label={`${p.name} 상세 보기`}
                  className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <ProjectCard project={p} />
                {p.repoUrl && (
                  <div className="absolute right-4 top-4 z-20">
                    <Button asChild variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} GitHub 저장소`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
