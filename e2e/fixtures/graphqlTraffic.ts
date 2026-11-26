import type { Page, Request } from "@playwright/test";

export type GraphqlCall = {
  name: string;
  start: number;
  end?: number;
  bytes: number;
  persistedQueryMiss: boolean;
};

const isGraphql = (request: Request) =>
  request.method() === "POST" &&
  new URL(request.url()).pathname.endsWith("/api/graphql");

const operationName = (request: Request): string => {
  try {
    return request.postDataJSON()?.operationName ?? "unknown";
  } catch {
    return "unknown";
  }
};

export const trackGraphql = (page: Page) => {
  let calls: GraphqlCall[] = [];
  const open = new Map<Request, GraphqlCall>();
  const reading: Promise<void>[] = [];
  let lastActivity = Date.now();

  page.on("request", (request) => {
    if (!isGraphql(request)) return;
    const call: GraphqlCall = {
      name: operationName(request),
      start: Date.now(),
      bytes: 0,
      persistedQueryMiss: false,
    };
    calls.push(call);
    open.set(request, call);
    lastActivity = call.start;
  });

  const finish = (request: Request) => {
    const call = open.get(request);
    if (!call) return;
    open.delete(request);
    call.end = Date.now();
    lastActivity = call.end;
    reading.push(
      Promise.all([
        request.sizes().catch(() => undefined),
        request
          .response()
          .then((response) => response?.text())
          .catch(() => ""),
      ]).then(([sizes, body]) => {
        call.bytes = sizes?.responseBodySize ?? 0;
        call.persistedQueryMiss = !!body?.includes("PERSISTED_QUERY_NOT_FOUND");
      }),
    );
  };
  page.on("requestfinished", finish);
  page.on("requestfailed", finish);

  const settled = async (quietMs = 1500, timeoutMs = 30_000) => {
    const since = Date.now();
    const deadline = since + timeoutMs;
    while (Date.now() < deadline) {
      const quietFor = Date.now() - Math.max(lastActivity, since);
      if (open.size === 0 && quietFor >= quietMs) break;
      await page.waitForTimeout(100);
    }
    await Promise.all(reading);
  };

  return {
    get calls() {
      return calls.filter((call) => !call.persistedQueryMiss);
    },
    get persistedQueryMisses() {
      return calls.filter((call) => call.persistedQueryMiss).length;
    },
    reset: () => {
      calls = [];
      lastActivity = Date.now();
    },
    settled,
  };
};
