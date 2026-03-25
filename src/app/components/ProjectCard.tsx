import type { PublicProject } from '@/app/lib/types';
import { Badge } from '@/app/components/ui/badge';
import { motion } from 'motion/react';

interface ProjectCardProps {
  project: PublicProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
        {project.thumbnailUrl === '' ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-lg font-medium text-foreground/60">
              {project.name}
            </span>
          </div>
        ) : (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <Badge variant="secondary">{project.category}</Badge>
        <h3 className="font-semibold text-foreground mt-2 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {project.description}
        </p>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
