import { useEffect, useMemo, useState } from 'react';
import { Building2, Clock3, Mail, Phone, RefreshCw } from 'lucide-react';
import { getInquiries, updateInquiryStatus } from '@/app/admin/services/api';
import type { AdminInquiry } from '@/app/admin/types';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

const STATUS_LABELS: Record<AdminInquiry['status'], string> = {
  new: '신규',
  contacted: '연락 완료',
  closed: '종료',
};

const STATUS_VARIANTS: Record<AdminInquiry['status'], 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  closed: 'outline',
};

type StatusFilter = 'all' | AdminInquiry['status'];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchInquiries() {
    setLoading(true);
    setError(null);

    try {
      const result = await getInquiries();
      setInquiries(result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '의뢰 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchInquiries();
  }, []);

  const filteredInquiries = useMemo(() => {
    if (filter === 'all') {
      return inquiries;
    }

    return inquiries.filter((inquiry) => inquiry.status === filter);
  }, [filter, inquiries]);

  async function handleStatusChange(inquiryId: string, status: AdminInquiry['status']) {
    setUpdatingId(inquiryId);

    try {
      const updated = await updateInquiryStatus(inquiryId, status);
      setInquiries((current) => current.map((inquiry) => (inquiry.id === updated.id ? updated : inquiry)));
    } catch (updateError) {
      window.alert(updateError instanceof Error ? updateError.message : '상태 변경에 실패했습니다.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">제작 의뢰</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            공개 문의 페이지에서 접수된 의뢰를 확인하고 상태를 관리합니다.
          </p>
        </div>
        <Button variant="outline" onClick={() => void fetchInquiries()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'closed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? '전체' : STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30">
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : filteredInquiries.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">표시할 의뢰가 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{inquiry.name}</h2>
                    <Badge variant={STATUS_VARIANTS[inquiry.status]}>
                      {STATUS_LABELS[inquiry.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {formatDateTime(inquiry.createdAt)}
                    </span>
                    {inquiry.projectType && <span>{inquiry.projectType}</span>}
                    {inquiry.budget && <span>{inquiry.budget}</span>}
                    {inquiry.timeline && <span>{inquiry.timeline}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['new', 'contacted', 'closed'] as const).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={inquiry.status === status ? 'default' : 'outline'}
                      disabled={updatingId === inquiry.id}
                      onClick={() => void handleStatusChange(inquiry.id, status)}
                    >
                      {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 py-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {inquiry.email}
                  </a>

                  {inquiry.phone && (
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-4 w-4" />
                      {inquiry.phone}
                    </a>
                  )}

                  {inquiry.company && (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {inquiry.company}
                    </span>
                  )}
                </div>

                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {inquiry.description}
                  </p>
                </div>

                {(inquiry.sourceUrl || inquiry.userAgent || inquiry.ipAddress) && (
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    {inquiry.sourceUrl && (
                      <p>
                        <span className="font-medium text-foreground">유입 페이지:</span>{' '}
                        <a href={inquiry.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                          {inquiry.sourceUrl}
                        </a>
                      </p>
                    )}
                    {inquiry.ipAddress && (
                      <p>
                        <span className="font-medium text-foreground">IP:</span> {inquiry.ipAddress}
                      </p>
                    )}
                    {inquiry.userAgent && (
                      <p className="break-all">
                        <span className="font-medium text-foreground">User-Agent:</span> {inquiry.userAgent}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
