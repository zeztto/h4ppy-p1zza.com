import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { usePublicData } from '@/app/hooks/usePublicData';
import type { PublicProject } from '@/app/lib/types';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { sortPortfolioProjects } from '@/app/lib/project-order';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, loading, error } = usePublicData<PublicProject>(`projects/${id}`);
  const { data: allProjects } = usePublicData<PublicProject[]>('projects');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="aspect-video w-full bg-muted rounded-xl mt-6 animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded mt-8 animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded mt-4 animate-pulse" />
        <div className="h-20 w-full bg-muted rounded mt-6 animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-xl text-muted-foreground">
          프로젝트를 찾을 수 없습니다.
        </p>
        <Link
          to="/portfolio"
          className="text-primary hover:text-primary/80 mt-4 inline-block"
        >
          포트폴리오로 돌아가기
        </Link>
      </div>
    );
  }

  const projects = sortPortfolioProjects(allProjects ?? []);
  const currentIndex = projects.findIndex((p) => p.id === id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < projects.length - 1
      ? projects[currentIndex + 1]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-6 py-24"
    >
      <Link
        to="/portfolio"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        포트폴리오
      </Link>

      <div className="aspect-video w-full rounded-xl overflow-hidden mt-6 bg-muted">
        {project.thumbnailUrl === '' ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-2xl font-medium text-foreground/40">
              {project.name}
            </span>
          </div>
        ) : (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="object-cover w-full h-full"
          />
        )}
      </div>

      <h1 className="text-4xl font-bold mt-8">{project.name}</h1>

      <div className="flex items-center gap-3 mt-4">
        {project.category && <Badge variant="secondary">{project.category}</Badge>}
        {project.year && (
          <span className="text-sm text-muted-foreground">{project.year}</span>
        )}
        {project.url && (
          <Button asChild variant="ghost" size="sm">
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              방문하기
            </a>
          </Button>
        )}
        {project.repoUrl && (
          <Button asChild variant="ghost" size="sm">
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </Button>
        )}
      </div>

      <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
        {project.description}
      </p>

      {project.longDescription && (
        <p className="text-muted-foreground mt-4 leading-relaxed">
          {project.longDescription}
        </p>
      )}

      {project.techStack.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Tech Stack</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {project.features.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Features</h3>
          <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground">
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {(prevProject || nextProject) && (
        <div className="flex justify-between mt-16 pt-8 border-t border-border">
          <div>
            {prevProject && (
              <Link
                to={`/portfolio/${prevProject.id}`}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {prevProject.name}
              </Link>
            )}
          </div>
          <div>
            {nextProject && (
              <Link
                to={`/portfolio/${nextProject.id}`}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              >
                {nextProject.name}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
