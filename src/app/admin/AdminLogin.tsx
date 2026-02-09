import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Code2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from './AuthContext';

export function AdminLogin() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">h4ppy p1zza</CardTitle>
            <CardDescription className="text-lg mt-2">관리자 대시보드</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            GitHub 계정으로 로그인하여
            <br />
            사이트를 관리하세요.
          </p>
          <Button onClick={login} className="w-full" size="lg">
            <Github className="mr-2 h-5 w-5" />
            GitHub로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
