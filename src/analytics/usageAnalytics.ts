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
    settings: UsageAnalyticsSettings & {
      sessionId: string;
      /** the build (pwa-version.json), on every event */
      pwaVersion?: string;
      /** the UI the deployment runs (the app config), on every event */
      uiVersion?: string;
    },
  ) => UsageTracker;
};

let tracker: UsageTracker | undefined;

// The OpenPanel web SDK is a separate chunk that only loads when the
// deployment's app config switches usage analytics on, and an analytics
// failure never stops the app from starting.
export const initUsageAnalytics = async (
  config: { usageAnalytics?: UsageAnalyticsSettings; uiVersion?: string },
  sessionId: string,
  load: () => Promise<OpenpanelWebModule> = () =>
    import("@/analytics/openpanelWeb"),
  pwaVersion?: string,
): Promise<boolean> => {
  if (!config.usageAnalytics) return false;
  try {
    tracker = (await load()).startUsageAnalytics({
      ...config.usageAnalytics,
      sessionId,
      ...(pwaVersion ? { pwaVersion } : {}),
      ...(config.uiVersion ? { uiVersion: config.uiVersion } : {}),
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

/*
 * The tracking plan's other events (elody-ui analytics tracking): each sent where
 * the user does the thing, with the names and properties the plan gives them.
 * Without the value an event is about, nothing is sent.
 */
const sendIf = (
  name: string,
  value: string | undefined,
  properties: Record<string, unknown>,
  entityType?: string,
): void => {
  if (!value) return;
  trackUsage(name, {
    ...properties,
    ...(entityType ? { entity_type: entityType } : {}),
  });
};

export const trackViewMode = (
  viewMode: string | undefined,
  entityType?: string,
) => sendIf("view_mode_changed", viewMode, { view_mode: viewMode }, entityType);

export const trackSort = (sort: string | undefined, entityType?: string) =>
  sendIf("sort_changed", sort, { sort }, entityType);

export const trackBulkOperation = (
  operation: string | undefined,
  selected: number,
  entityType?: string,
) => sendIf("bulk_operation", operation, { operation, selected }, entityType);

export const trackContextAction = (
  action: string | undefined,
  actionType: string | undefined,
  entityType?: string,
) =>
  sendIf(
    "context_action",
    action,
    { action, ...(actionType ? { action_type: actionType } : {}) },
    entityType,
  );

export const trackFormOpened = (
  form: string | undefined,
  entityType?: string,
) => sendIf("form_opened", form, { form }, entityType);

export const trackFormSubmitted = (
  form: string | undefined,
  outcome: "ok" | "error",
  entityType?: string,
) => sendIf("form_submitted", form, { form, outcome }, entityType);

/** The group a user is counted in (analytics/userGroup.ts says which). */
export type UserGroup = { id: string; name: string; type: string };

/** The domain of a user's e-mail address: their group, unless the config names another. */
export const libraryOf = (email: string | undefined): string | undefined => {
  const domain = email?.split("@")[1]?.trim().toLowerCase();
  return domain || undefined;
};

/** A stable pseudonym for a user id or e-mail: never the id or address itself. */
export const pseudonymOf = async (id: string): Promise<string> =>
  (await sha256(`elody:${id}`)).slice(0, 16);

/** Counts the user's events in a group from now on. */
export const putUserInGroup = (group: UserGroup): void => {
  try {
    tracker?.upsertGroup(group);
    tracker?.setGroup(group.id);
  } catch (error) {
    console.warn("Usage analytics could not set the user's group", error);
  }
};

/**
 * Identifies the logged-in user to OpenPanel by pseudonym, in their group
 * when it is known already; returns the pseudonym (also for HyperDX), or
 * undefined without a user.
 */
export const identifyUser = async (
  user: { sub?: string; email?: string } | undefined,
  group?: UserGroup,
): Promise<string | undefined> => {
  const id = user?.sub || user?.email;
  if (!id) return undefined;
  const pseudonym = await pseudonymOf(id);
  if (!tracker) return pseudonym;
  try {
    tracker.identify({
      profileId: pseudonym,
      properties: group ? { [group.type]: group.name } : {},
    });
  } catch (error) {
    console.warn("Usage analytics could not identify the user", error);
  }
  if (group) putUserInGroup(group);
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
