import { useState, useEffect } from 'react';

export function useSettings<T>(key: string, fallback: T): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/settings/${key}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (!cancelled && result?.value) {
          try {
            setData(typeof result.value === 'string' ? JSON.parse(result.value) : result.value);
          } catch { /* use fallback */ }
        }
      })
      .catch(() => { /* use fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key]);

  return { data, loading };
}
