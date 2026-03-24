'use client';

import { useEffect, useState } from 'react';

export function useCodigoPostalAutofill(codigoPostal, setFormData) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cp = (codigoPostal || '').replace(/\D/g, '');

    if (cp.length !== 5) {
      setLoading(false);
      return undefined;
    }

    const ac = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/codigo-postal?cp=${encodeURIComponent(cp)}`,
          { signal: ac.signal }
        );
        if (!res.ok) return;

        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          localidad: data.localidad || '',
          provincia: data.provincia || '',
        }));
      } catch (e) {
        if (e.name !== 'AbortError') {
          /* ignorar red / cancelación */
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [codigoPostal, setFormData]);

  return loading;
}
