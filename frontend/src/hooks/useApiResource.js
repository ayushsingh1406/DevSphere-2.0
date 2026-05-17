import { useCallback, useEffect, useState } from "react";

export function useApiResource(loader) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const payload = await loader();
      setData(payload);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setIsLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    // Data fetching is the external synchronization this hook owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return {
    data,
    error,
    isLoading,
    reload: load,
    mutate: setData
  };
}
