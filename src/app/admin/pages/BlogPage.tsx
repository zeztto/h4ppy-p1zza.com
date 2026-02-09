import { Plus, FileText, Calendar, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

export function BlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">블로그 관리</h1>
          <p className="text-muted-foreground">블로그 포스트를 작성하고 관리합니다.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />새 포스트
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 포스트</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 작성
            </CardTitle>
            <Calendar className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 조회수</CardTitle>
            <Eye className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>포스트 목록</CardTitle>
          <CardDescription>작성한 블로그 포스트 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">아직 포스트가 없습니다</h3>
            <p className="text-muted-foreground mb-4">첫 번째 블로그 포스트를 작성해보세요.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />새 포스트 작성
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>블로그 설정</CardTitle>
          <CardDescription>블로그 관련 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">블로그 활성화</p>
              <p className="text-sm text-muted-foreground">
                메인 사이트에 블로그 메뉴를 표시합니다.
              </p>
            </div>
            <Button variant="outline" disabled>
              준비 중
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
