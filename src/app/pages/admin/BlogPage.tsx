import { FileText } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold mt-4">블로그</h1>
      <p className="text-muted-foreground mt-2">블로그 기능은 준비 중입니다.</p>
    </div>
  );
}
