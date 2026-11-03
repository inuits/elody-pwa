import { OpenPanel } from "@openpanel/web";
import type {
  UsageAnalyticsSettings,
  UsageTracker,
} from "@/analytics/usageAnalytics";
import { uiVersion } from "@/analytics/uiVersion";

export const startUsageAnalytics = ({
  clientId,
  apiUrl,
  sessionId,
  pwaVersion,
  uiVersion: configuredUiVersion,
}: UsageAnalyticsSettings & {
  sessionId: string;
  pwaVersion?: string;
  uiVersion?: string;
}): UsageTracker => {
  const op = new OpenPanel({
    clientId,
    // the app's own telemetry proxy (the GraphQL server) is given as a path
    apiUrl: new URL(apiUrl, window.location.origin)
      .toString()
      .replace(/\/$/, ""),
    // page views of the single-page app, from the browser's history
    trackScreenViews: true,
    trackOutgoingLinks: false,
    // no data-track attributes and no session replay: events are named in code
    trackAttributes: false,
  });
  op.setGlobalProperties({
    session_id: sessionId,
    ui_version: uiVersion(configuredUiVersion),
    ...(pwaVersion ? { pwa_version: pwaVersion } : {}),
  });
  return {
    track: (name, properties) => op.track(name, properties),
    identify: (payload) => op.identify(payload),
    setGroup: (groupId) => op.setGroup(groupId),
    upsertGroup: (group) => op.upsertGroup(group),
  };
};
