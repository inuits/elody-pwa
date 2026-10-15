import { OpenPanel } from "@openpanel/web";
import type {
  UsageAnalyticsSettings,
  UsageTracker,
} from "@/analytics/usageAnalytics";

export const startUsageAnalytics = ({
  clientId,
  apiUrl,
  sessionId,
}: UsageAnalyticsSettings & { sessionId: string }): UsageTracker => {
  const op = new OpenPanel({
    clientId,
    apiUrl,
    // page views of the single-page app, from the browser's history
    trackScreenViews: true,
    trackOutgoingLinks: false,
    // no data-track attributes and no session replay: events are named in code
    trackAttributes: false,
  });
  op.setGlobalProperties({ session_id: sessionId });
  return {
    track: (name, properties) => op.track(name, properties),
    identify: (payload) => op.identify(payload),
    setGroup: (groupId) => op.setGroup(groupId),
    upsertGroup: (group) => op.upsertGroup(group),
  };
};
