export type BrowserTracingSettings = {
  /** the collector's OTLP/HTTP traces endpoint; logs go to the sibling /v1/logs */
  tracesUrl: string;
  serviceName: string;
  /** the collector's ingestion key, when it wants one */
  apiKey?: string;
  /** the tab's session id (observability/sessionId), on everything sent */
  sessionId?: string;
};

export type BrowserTracingUser = { pseudonym: string; library?: string };

export type BrowserTracing = {
  identify: (user: BrowserTracingUser) => void;
};

type HyperdxBrowserModule = {
  startBrowserTracing: (
    settings: BrowserTracingSettings,
  ) => BrowserTracing | void;
};

let tracing: BrowserTracing | undefined;

// The HyperDX browser SDK (traces, errors, console, session replay) is a
// separate chunk that only loads when the deployment's app config switches
// browser tracing on, and a tracing failure never stops the app from starting.
export const initBrowserTracing = async (
  config: { browserTracing?: BrowserTracingSettings },
  load: () => Promise<HyperdxBrowserModule> = () =>
    import("@/tracing/hyperdxBrowser"),
  sessionId?: string,
): Promise<boolean> => {
  if (!config.browserTracing) return false;
  try {
    tracing =
      (await load()).startBrowserTracing({
        ...config.browserTracing,
        ...(sessionId ? { sessionId } : {}),
      }) || undefined;
    return true;
  } catch (error) {
    console.warn("Browser tracing could not be started", error);
    return false;
  }
};

export const resetBrowserTracing = () => {
  tracing = undefined;
};

/** The user by pseudonym, and their library, on everything the SDK sends from now on. */
export const identifyInBrowserTracing = (user: BrowserTracingUser): void => {
  try {
    tracing?.identify(user);
  } catch (error) {
    console.warn("Browser tracing could not identify the user", error);
  }
};
