import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useAuth } from '@/app/admin/AuthContext';
import { startLogin } from '@/app/admin/services/api';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">h4ppy p1zza</h1>
          <p className="text-muted-foreground">관리자 로그인</p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => startLogin()} className="w-full mt-6">
            <Github className="h-5 w-5" />
            GitHub로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
