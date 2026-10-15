export type BrowserTracingSettings = {
  tracesUrl: string;
  serviceName: string;
  /** the tab's session id (observability/sessionId), put on every span */
  sessionId?: string;
};

type OtelWebModule = {
  startBrowserTracing: (settings: BrowserTracingSettings) => void;
};

// The OpenTelemetry web SDK is a separate chunk that only loads when the
// deployment's app config switches browser tracing on, and a tracing failure
// never stops the app from starting.
export const initBrowserTracing = async (
  config: { browserTracing?: BrowserTracingSettings },
  load: () => Promise<OtelWebModule> = () => import("@/tracing/otelWeb"),
  sessionId?: string,
): Promise<boolean> => {
  if (!config.browserTracing) return false;
  try {
    (await load()).startBrowserTracing({
      ...config.browserTracing,
      ...(sessionId ? { sessionId } : {}),
    });
    return true;
  } catch (error) {
    console.warn("Browser tracing could not be started", error);
    return false;
  }
};
