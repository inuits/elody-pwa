import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { client, clientName } from "../client";
import { serveBuiltFrontend, usesBuiltFrontend } from "../fixtures/frontend";
import { trackGraphql } from "../fixtures/graphqlTraffic";
import { visibleResults } from "../fixtures/entities";

const runs = Number(process.env.PERF_RUNS ?? 5);
const label = process.env.PERF_LABEL ?? "unlabelled";
const resultsFile = path.join(import.meta.dirname, "results.js");
const resultsPrefix = "window.PERF_RESULTS = ";
const profiles: Record<string, number> = { local: 0, "100ms latency": 100 };

type FlowResult = {
  requests: number;
  persistedQueryMisses: number;
  entityMs: number;
  doneMs: number;
  kb: number;
};
type Flow = "reload" | "listToDetail" | "session";

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const medianResult = (results: FlowResult[]): FlowResult => ({
  requests: median(results.map((r) => r.requests)),
  persistedQueryMisses: median(results.map((r) => r.persistedQueryMisses)),
  entityMs: median(results.map((r) => r.entityMs)),
  doneMs: median(results.map((r) => r.doneMs)),
  kb: median(results.map((r) => r.kb)),
});

const git = (command: string) =>
  execSync(`git ${command}`, { cwd: path.join(import.meta.dirname, "../..") })
    .toString()
    .trim();

const readResults = (): unknown[] =>
  existsSync(resultsFile)
    ? JSON.parse(
        readFileSync(resultsFile, "utf8")
          .replace(resultsPrefix, "")
          .replace(/;\s*$/, ""),
      )
    : [];

test("measure detail page loading", async ({ page }) => {
  test.setTimeout(60 * 60_000);
  if (usesBuiltFrontend) await serveBuiltFrontend(page.context());
  const traffic = trackGraphql(page);
  let latency = 0;
  await page.context().route(
    (url) => url.pathname.startsWith("/api"),
    async (route) => {
      if (latency) await new Promise((r) => setTimeout(r, latency));
      await route.continue();
    },
  );
  const listPath = `/${client.listEntityType}`;

  const measure = async (action: () => Promise<unknown>) => {
    traffic.reset();
    const start = Date.now();
    await action();
    await traffic.settled();
    const calls = traffic.calls;
    const entity = calls.find((call) => call.name === "getEntityById");
    return {
      result: {
        requests: calls.length,
        persistedQueryMisses: traffic.persistedQueryMisses,
        entityMs: entity?.end ? entity.end - start : 0,
        doneMs: Math.max(
          0,
          ...calls.map((call) => (call.end ?? start) - start),
        ),
        kb: Math.round(calls.reduce((sum, call) => sum + call.bytes, 0) / 1024),
      },
      operations: calls.map((call) => call.name),
    };
  };

  const openList = async () => {
    await page.goto(listPath);
    await expect(visibleResults(page).first()).toBeVisible();
    await traffic.settled();
  };

  const openItem = async (index: number) => {
    await visibleResults(page).nth(index).click();
    await page.waitForURL((url) => url.pathname !== listPath);
  };

  await openList();
  await openItem(0);
  const detailPath = new URL(page.url()).pathname;
  await traffic.settled();

  const byProfile: Record<string, Record<Flow, FlowResult>> = {};
  let operations: string[] = [];

  for (const [profile, profileLatency] of Object.entries(profiles)) {
    latency = profileLatency;
    const flows: Record<Flow, FlowResult[]> = {
      reload: [],
      listToDetail: [],
      session: [],
    };

    for (let run = 0; run < runs; run++) {
      await page.goto("about:blank");
      flows.reload.push((await measure(() => page.goto(detailPath))).result);

      await openList();
      const listToDetail = await measure(() => openItem(0));
      flows.listToDetail.push(listToDetail.result);
      if (profile === "local") operations = listToDetail.operations;

      await openList();
      const steps = [
        () => openItem(0),
        () => page.goBack(),
        () => openItem(1),
        () => page.goBack(),
        () => openItem(0),
      ];
      const session: FlowResult = {
        requests: 0,
        persistedQueryMisses: 0,
        entityMs: 0,
        doneMs: 0,
        kb: 0,
      };
      for (const step of steps) {
        const { result } = await measure(step);
        session.requests += result.requests;
        session.persistedQueryMisses += result.persistedQueryMisses;
        session.doneMs += result.doneMs;
        session.kb += result.kb;
      }
      flows.session.push(session);
    }

    byProfile[profile] = {
      reload: medianResult(flows.reload),
      listToDetail: medianResult(flows.listToDetail),
      session: medianResult(flows.session),
    };
  }

  const dirty = git("status --porcelain --untracked-files=no")
    .split("\n")
    .some((line) => line && !line.endsWith("e2e/perf/results.js"));
  const results = [
    ...readResults(),
    {
      label,
      date: new Date().toISOString(),
      client: clientName,
      commit: git("rev-parse --short HEAD") + (dirty ? "+changes" : ""),
      frontend: usesBuiltFrontend ? "built" : "dev",
      runs,
      detailPath,
      profiles: byProfile,
      operations: operations.reduce<Record<string, number>>(
        (counts, name) => ({ ...counts, [name]: (counts[name] ?? 0) + 1 }),
        {},
      ),
    },
  ];
  writeFileSync(
    resultsFile,
    `${resultsPrefix}${JSON.stringify(results, null, 2)};\n`,
  );
});
