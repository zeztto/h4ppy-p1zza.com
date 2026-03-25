import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <span className="text-8xl font-bold text-muted-foreground/30">404</span>
      <p className="text-xl text-muted-foreground mt-4">
        페이지를 찾을 수 없습니다
      </p>
      <Button asChild className="mt-8">
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
