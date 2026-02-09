import { useState } from 'react';
import { Plus, Search, ExternalLink, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { projects as initialProjects, type Project } from '@/data/projects';

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...new Set(initialProjects.map((p) => p.category))];

  const filteredProjects = initialProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">프로젝트 관리</h1>
          <p className="text-muted-foreground">포트폴리오 프로젝트를 관리합니다.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />새 프로젝트
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">검색 결과가 없습니다.</p>
            ) : (
              filteredProjects.map((project) => <ProjectRow key={project.id} project={project} />)
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub 연동</CardTitle>
          <CardDescription>
            프로젝트 데이터는 GitHub 저장소에 JSON 파일로 저장됩니다. 변경 사항을 저장하면 자동으로
            커밋됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            현재 총 <strong>{initialProjects.length}개</strong>의 프로젝트가 등록되어 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
      <button type="button" className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{project.name}</span>
          <Badge variant="secondary" className="text-xs">
            {project.category}
          </Badge>
          {project.year && (
            <Badge variant="outline" className="text-xs">
              {project.year}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{project.description}</p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" asChild>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
