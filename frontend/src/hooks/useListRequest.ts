import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

export function isAbortError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

type RefreshListener = (active: boolean) => void;

const refreshListeners = new Set<RefreshListener>();
let globalRefreshing = false;

function notifyRefreshing(active: boolean) {
  if (globalRefreshing === active) {
    return;
  }

  globalRefreshing = active;
  refreshListeners.forEach((listener) => listener(active));
}

export function useListRefreshing(): boolean {
  const [active, setActive] = useState(globalRefreshing);

  useEffect(() => {
    const listener: RefreshListener = (next) => setActive(next);
    refreshListeners.add(listener);
    setActive(globalRefreshing);

    return () => {
      refreshListeners.delete(listener);
    };
  }, []);

  return active;
}

export function useListRequest() {
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const begin = useCallback(() => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    if (loadedRef.current) {
      setIsRefreshing(true);
      notifyRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    return controller.signal;
  }, []);

  const succeed = useCallback((signal: AbortSignal) => {
    if (signal.aborted) {
      return;
    }

    loadedRef.current = true;
    setInitialLoading(false);
    setIsRefreshing(false);
    notifyRefreshing(false);
  }, []);

  const fail = useCallback((signal: AbortSignal) => {
    if (signal.aborted) {
      return;
    }

    setInitialLoading(false);
    setIsRefreshing(false);
    notifyRefreshing(false);
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      notifyRefreshing(false);
    },
    []
  );

  return {
    initialLoading,
    isRefreshing,
    begin,
    succeed,
    fail,
  };
}
