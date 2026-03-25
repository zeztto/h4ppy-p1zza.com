import { Badge } from '@/app/components/ui/badge';
import { SectionHeading } from '@/app/components/SectionHeading';

const skillGroups = [
  {
    category: 'Frontend',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'SQLite', 'REST API'],
  },
  {
    category: 'Tools',
    skills: ['Git', 'Vite', 'Figma', 'Vercel', 'Railway', 'Cloudinary'],
  },
];

export function SkillsSection() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading title="기술 스택" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <h3 className="font-semibold text-foreground mb-3">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
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
