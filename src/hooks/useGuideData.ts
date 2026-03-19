import { useState, useEffect } from 'react';
import type { GuideData } from '../types/guide';

interface UseGuideDataResult {
  data: GuideData | null;
  loading: boolean;
  error: string | null;
}

export function useGuideData(jsonPath: string): UseGuideDataResult {
  const [data, setData] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load guide data`);
        return res.json() as Promise<GuideData>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [jsonPath]);

  return { data, loading, error };
}
