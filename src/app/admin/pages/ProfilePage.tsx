import { Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">프로필 편집</h1>
          <p className="text-muted-foreground">About 페이지에 표시되는 정보를 수정합니다.</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          저장하기
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>사이트에 표시되는 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이름</label>
              <input
                type="text"
                defaultValue="h4ppy p1zza"
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">직함 / 역할</label>
              <input
                type="text"
                defaultValue="웹 개발자"
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">소개</label>
              <textarea
                rows={4}
                defaultValue="웹 애플리케이션 개발을 전문으로 하는 개발자입니다. 사용자 경험을 최우선으로 생각하며, 실용적이고 아름다운 웹 서비스를 만듭니다."
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>소셜 링크</CardTitle>
            <CardDescription>소셜 미디어 및 연락처 링크입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub</label>
              <input
                type="url"
                defaultValue="https://github.com/zeztto"
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram</label>
              <input
                type="url"
                defaultValue="https://instagram.com/h4ppy_p1zza"
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">이메일</label>
              <input
                type="email"
                placeholder="이메일 주소"
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>기술 스택</CardTitle>
            <CardDescription>보유 기술 및 사용 도구 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">기술 스택 편집 기능은 준비 중입니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
