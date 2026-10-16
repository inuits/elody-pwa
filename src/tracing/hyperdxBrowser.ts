import HyperDX from "@hyperdx/browser";
import type {
  BrowserTracing,
  BrowserTracingSettings,
} from "@/tracing/browserTracing";

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const startBrowserTracing = ({
  tracesUrl,
  serviceName,
  apiKey,
  sessionId,
  attributes,
}: BrowserTracingSettings): BrowserTracing => {
  HyperDX.init({
    apiKey: apiKey ?? "",
    service: serviceName,
    tracesUrl,
    logsUrl: tracesUrl.replace(/\/v1\/traces$/, "/v1/logs"),
    // Requests to the app's own API carry a traceparent, so GraphQL and
    // collection-api join the browser's trace. Only this origin: OpenPanel's
    // API also sits under /api, and would refuse the extra header.
    tracePropagationTargets: [
      new RegExp(`^${escapeRegExp(window.location.origin)}/api/`),
      /^\/api\//,
    ],
    consoleCapture: true,
    advancedNetworkCapture: false,
    // the session replay shows the screens, never what was typed
    maskAllInputs: true,
  });
  const session = {
    ...(sessionId ? { session_id: sessionId } : {}),
    ...attributes,
  };
  if (Object.keys(session).length) HyperDX.setGlobalAttributes(session);
  return {
    identify: ({ pseudonym, library }) =>
      HyperDX.setGlobalAttributes({
        ...session,
        userId: pseudonym,
        ...(library ? { teamId: library } : {}),
      }),
  };
};
