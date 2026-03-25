import { useState, useEffect } from 'react';

export function usePublicData<T>(
  endpoint: string,
  fallback?: T,
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/public/${endpoint}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
        }

        const json = (await res.json()) as T;

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          if (fallback !== undefined) {
            setData(fallback);
          } else {
            setError(
              err instanceof Error ? err.message : 'An unknown error occurred',
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading, error };
}
