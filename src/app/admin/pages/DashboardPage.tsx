import { LayoutDashboard, FolderKanban, FileText, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

export function DashboardPage() {
  const stats = [
    { label: '프로젝트', value: 36, icon: FolderKanban, color: 'text-blue-500' },
    { label: '블로그 포스트', value: 0, icon: FileText, color: 'text-green-500' },
    { label: '카테고리', value: 6, icon: LayoutDashboard, color: 'text-purple-500' },
    { label: '방문자 (오늘)', value: '-', icon: TrendingUp, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">사이트 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/projects"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="font-medium">새 프로젝트 추가</div>
              <div className="text-sm text-muted-foreground">
                포트폴리오에 새 프로젝트를 추가합니다.
              </div>
            </a>
            <a href="/admin/blog" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium">블로그 글 작성</div>
              <div className="text-sm text-muted-foreground">새 블로그 포스트를 작성합니다.</div>
            </a>
            <a
              href="/admin/profile"
              className="block p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="font-medium">프로필 수정</div>
              <div className="text-sm text-muted-foreground">About 페이지 내용을 수정합니다.</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>최근 변경 사항을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">아직 기록된 활동이 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
