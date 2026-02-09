import { Save, GripVertical, Pencil } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const sections = [
  { id: 'hero', name: '히어로 섹션', description: '메인 페이지 상단 소개 영역', enabled: true },
  {
    id: 'projects',
    name: '주요 프로젝트',
    description: '홈에 표시되는 주요 프로젝트 그리드',
    enabled: true,
  },
  { id: 'values', name: '핵심 가치', description: '개발 철학 및 가치 카드', enabled: true },
  { id: 'skills', name: '기술 스택', description: '보유 기술 및 도구 목록', enabled: true },
  { id: 'experience', name: '주요 업무', description: '제공하는 서비스 및 경험', enabled: true },
];

const categories = [
  { id: 'media', name: 'Media', count: 4, color: 'bg-blue-500' },
  { id: 'tools', name: 'Tools', count: 11, color: 'bg-green-500' },
  { id: 'finance', name: 'Finance', count: 5, color: 'bg-yellow-500' },
  { id: 'productivity', name: 'Productivity', count: 3, color: 'bg-purple-500' },
  { id: 'games', name: 'Games', count: 5, color: 'bg-red-500' },
  { id: 'archive', name: 'Archive', count: 8, color: 'bg-gray-500' },
];

export function SectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">섹션 관리</h1>
          <p className="text-muted-foreground">홈페이지 섹션과 카테고리를 관리합니다.</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          변경사항 저장
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>홈 섹션</CardTitle>
            <CardDescription>
              홈페이지에 표시되는 섹션의 순서와 표시 여부를 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <button
                  type="button"
                  className="cursor-grab text-muted-foreground hover:text-foreground"
                >
                  <GripVertical className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.name}</span>
                    <Badge variant={section.enabled ? 'default' : 'secondary'}>
                      {section.enabled ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>프로젝트 카테고리</CardTitle>
            <CardDescription>프로젝트 분류에 사용되는 카테고리를 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge variant="outline">{category.count}개</Badge>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>네비게이션</CardTitle>
          <CardDescription>사이트 상단 네비게이션 메뉴를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">네비게이션 편집 기능은 준비 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
