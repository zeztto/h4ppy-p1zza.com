import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

export function AdminCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(searchParams.get('error_description') || 'Authentication failed');
      setTimeout(() => navigate('/admin/login'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setTimeout(() => navigate('/admin/login'), 3000);
      return;
    }

    handleCallback(code).then((success) => {
      if (success) {
        navigate('/admin');
      } else {
        setError('Failed to authenticate');
        setTimeout(() => navigate('/admin/login'), 3000);
      }
    });
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-destructive">{error}</p>
        <p className="text-muted-foreground">로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">인증 중...</p>
    </div>
  );
}
