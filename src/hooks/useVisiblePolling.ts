import { useEffect, useRef } from "react";

type UseVisiblePollingOptions = {
  enabled?: boolean;
  intervalMs: number;
  runImmediately?: boolean;
};

export function useVisiblePolling(
  callback: () => void | Promise<void>,
  {
    enabled = true,
    intervalMs,
    runImmediately = false,
  }: UseVisiblePollingOptions,
) {
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0 || typeof window === "undefined") return;

    let isCancelled = false;

    const run = async () => {
      if (
        isCancelled ||
        isRunningRef.current ||
        (typeof document !== "undefined" && document.hidden)
      ) {
        return;
      }

      isRunningRef.current = true;

      try {
        await callbackRef.current();
      } catch (error) {
        console.error("Polling callback failed:", error);
      } finally {
        isRunningRef.current = false;
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void run();
      }
    };

    const intervalId = window.setInterval(() => {
      void run();
    }, intervalMs);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (runImmediately) {
      void run();
    }

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMs, runImmediately]);
}
