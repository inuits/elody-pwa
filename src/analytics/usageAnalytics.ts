import { ApolloLink, Observable } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { sha256 } from "crypto-hash";

export type UsageAnalyticsSettings = {
  clientId: string;
  apiUrl: string;
};

export type UsageTracker = {
  track: (name: string, properties?: Record<string, unknown>) => void;
  identify: (payload: {
    profileId: string;
    properties?: Record<string, unknown>;
  }) => void;
  setGroup: (groupId: string) => void;
  upsertGroup: (group: { id: string; type: string; name: string }) => void;
};

type OpenpanelWebModule = {
  startUsageAnalytics: (
    settings: UsageAnalyticsSettings & { sessionId: string },
  ) => UsageTracker;
};

let tracker: UsageTracker | undefined;

// The OpenPanel web SDK is a separate chunk that only loads when the
// deployment's app config switches usage analytics on, and an analytics
// failure never stops the app from starting.
export const initUsageAnalytics = async (
  config: { usageAnalytics?: UsageAnalyticsSettings },
  sessionId: string,
  load: () => Promise<OpenpanelWebModule> = () =>
    import("@/analytics/openpanelWeb"),
): Promise<boolean> => {
  if (!config.usageAnalytics) return false;
  try {
    tracker = (await load()).startUsageAnalytics({
      ...config.usageAnalytics,
      sessionId,
    });
    return true;
  } catch (error) {
    console.warn("Usage analytics could not be started", error);
    return false;
  }
};

export const resetUsageAnalytics = () => {
  tracker = undefined;
};

export const trackUsage = (
  name: string,
  properties: Record<string, unknown> = {},
): void => {
  try {
    tracker?.track(name, properties);
  } catch (error) {
    console.warn("Usage event could not be sent", error);
  }
};

/**
 * A search someone ran, by where they ran it and how long the query was: what
 * they searched for stays out of the usage events. Clearing a search is not one.
 */
export const trackSearch = (
  query: string | undefined,
  context: { scope: "header" | "library"; entity_type?: string },
): void => {
  const length = query?.trim().length ?? 0;
  if (!length) return;
  trackUsage("search", { query_length: length, ...context });
};

/** The library a user works for: the domain of their e-mail address. */
export const libraryOf = (email: string | undefined): string | undefined => {
  const domain = email?.split("@")[1]?.trim().toLowerCase();
  return domain || undefined;
};

/** A stable pseudonym for a user id or e-mail: never the id or address itself. */
export const pseudonymOf = async (id: string): Promise<string> =>
  (await sha256(`elody:${id}`)).slice(0, 16);

/**
 * Identifies the logged-in user to OpenPanel by pseudonym, in the group of
 * their library; returns the pseudonym (also for HyperDX), or undefined
 * without a user.
 */
export const identifyUser = async (
  user: { sub?: string; email?: string } | undefined,
): Promise<string | undefined> => {
  const id = user?.sub || user?.email;
  if (!id) return undefined;
  const pseudonym = await pseudonymOf(id);
  if (!tracker) return pseudonym;
  const library = libraryOf(user?.email);
  try {
    tracker.identify({
      profileId: pseudonym,
      properties: library ? { library } : {},
    });
    if (library) {
      tracker.upsertGroup({ id: library, type: "library", name: library });
      tracker.setGroup(library);
    }
  } catch (error) {
    console.warn("Usage analytics could not identify the user", error);
  }
  return pseudonym;
};

const entityTypeOf = (variables: Record<string, any>): string | undefined => {
  const type =
    variables?.entity?.type ?? variables?.type ?? variables?.entityType;
  return typeof type === "string" ? type : undefined;
};

/**
 * Every mutation is a usage event named after its GraphQL operation: the
 * operations are declared per client (forms, bulk operations, relations), so
 * the events speak the declaration's names. Queries are not tracked.
 */
export const createUsageLink = (
  track: typeof trackUsage = trackUsage,
): ApolloLink =>
  new ApolloLink((operation, forward) => {
    const definition = getMainDefinition(operation.query);
    if (
      definition.kind !== "OperationDefinition" ||
      definition.operation !== "mutation"
    )
      return forward(operation);
    const entityType = entityTypeOf(operation.variables);
    const report = (outcome: "ok" | "error") =>
      track(operation.operationName || "anonymousMutation", {
        kind: "mutation",
        outcome,
        ...(entityType ? { entity_type: entityType } : {}),
      });
    return new Observable((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          report(result.errors?.length ? "error" : "ok");
          observer.next(result);
        },
        error: (error) => {
          report("error");
          observer.error(error);
        },
        complete: () => observer.complete(),
      });
      return () => subscription.unsubscribe();
    });
  });

const hasValue = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !(Array.isArray(value) && value.length === 0);

/**
 * The filters a user applied, by logical path (the key without its
 * `<client>:<version>|` prefix, as the analytics overlay names it); the type
 * filter and filters without a value left out.
 */
export const appliedFilterPaths = (
  filters: { type?: string; key?: string | string[]; value?: unknown }[],
): string[] =>
  filters
    .filter((filter) => filter.type !== "type" && hasValue(filter.value))
    .flatMap((filter) =>
      (Array.isArray(filter.key) ? filter.key : [filter.key])
        .filter((key): key is string => !!key)
        .map((key) => key.replace(/^[A-Za-z][\w-]*:\d+\|/, "")),
    );
