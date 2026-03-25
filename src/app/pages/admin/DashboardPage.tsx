import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Globe, FileEdit, Layers, Plus, User, ExternalLink } from 'lucide-react';
import { getDashboard } from '@/app/admin/services/api';
import type { AdminDashboardResponse, AdminActivity } from '@/app/admin/types';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-16 animate-pulse rounded bg-muted mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card className="mt-6 border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => void fetchDashboard()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: 'Total Projects',
      value: data.stats.projectsTotal,
      icon: FolderKanban,
      color: 'text-blue-500',
    },
    {
      label: 'Published',
      value: data.stats.projectsPublished,
      icon: Globe,
      color: 'text-green-500',
    },
    {
      label: 'Draft',
      value: data.stats.projectsDraft,
      icon: FileEdit,
      color: 'text-yellow-500',
    },
    {
      label: 'Sections',
      value: data.stats.sectionsTotal,
      icon: Layers,
      color: 'text-purple-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        <Button asChild>
          <Link to="/admin/projects">
            <Plus className="h-4 w-4" />
            새 프로젝트
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/profile">
            <User className="h-4 w-4" />
            프로필 편집
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            사이트 보기
          </a>
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">최근 활동</h2>
        {data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {data.recentActivity.map((activity: AdminActivity) => (
              <Card key={activity.id}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(activity.createdAt).toLocaleDateString('ko-KR')}
                  </time>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">최근 활동이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
