import HyperDX from "@hyperdx/browser";
import { captureConsole } from "@/tracing/consoleCapture";
import { uiVersion } from "@/analytics/uiVersion";
import type {
  BrowserTracing,
  BrowserTracingSettings,
} from "@/tracing/browserTracing";

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// the app's own telemetry proxy (the GraphQL server) is given as a path
const onThisOrigin = (url: string) =>
  new URL(url, window.location.origin).toString();

// what the browser sends to the telemetry proxy is not itself traced
const TELEMETRY_REQUESTS = /\/api\/telemetry\//;

export const startBrowserTracing = ({
  tracesUrl,
  serviceName,
  apiKey,
  sessionId,
  pwaVersion,
  uiVersion: configuredUiVersion,
  attributes,
}: BrowserTracingSettings): BrowserTracing => {
  const traces = onThisOrigin(tracesUrl);
  const consoleBeforeInit = { warn: console.warn, error: console.error };
  HyperDX.init({
    apiKey: apiKey ?? "",
    service: serviceName,
    tracesUrl: traces,
    logsUrl: traces.replace(/\/v1\/traces$/, "/v1/logs"),
    ignoreUrls: [TELEMETRY_REQUESTS],
    // Requests to the app's own API carry a traceparent, so GraphQL and
    // collection-api join the browser's trace. Only this origin: OpenPanel's
    // API also sits under /api, and would refuse the extra header.
    tracePropagationTargets: [
      new RegExp(`^${escapeRegExp(window.location.origin)}/api/`),
      /^\/api\//,
    ],
    // HyperDX's console capture JSON-stringifies every argument, and a Vue
    // warning carrying a component freezes the tab: see captureConsole below
    consoleCapture: false,
    advancedNetworkCapture: false,
    // the session replay shows the screens, never what was typed
    maskAllInputs: true,
  });
  // Console warnings and errors as HyperDX's console spans, with the arguments
  // reduced to short text. console.error goes back to its unpatched self, past
  // HyperDX's error capture (which stringifies them too); uncaught errors and
  // rejections still reach that.
  captureConsole(console, consoleBeforeInit, (level, message, error) => {
    HyperDX.addAction(`console.${level}`, {
      component: "console",
      level,
      message,
    });
    if (error) HyperDX.recordException(error);
  });
  const session = {
    ...(sessionId ? { session_id: sessionId } : {}),
    ui_version: uiVersion(configuredUiVersion),
    ...(pwaVersion ? { pwa_version: pwaVersion } : {}),
    ...attributes,
  };
  HyperDX.setGlobalAttributes(session);
  return {
    identify: ({ pseudonym, group }) =>
      HyperDX.setGlobalAttributes({
        ...session,
        userId: pseudonym,
        ...(group ? { teamId: group } : {}),
      }),
  };
};
