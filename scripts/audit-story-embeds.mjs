#!/usr/bin/env node
/**
 * Verifies that every <StoryEmbed id="…"> in the docs site's design-system
 * pages resolves against a built Storybook index.
 *
 *   pnpm build-storybook
 *   node scripts/audit-story-embeds.mjs ../elody-docs/docs/design-system
 *
 * Exits non-zero when an embed points at a story that does not exist, so it
 * can guard CI once the docs and the workshop build in one pipeline.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const docsDir = process.argv[2] ?? "../elody-docs/docs/design-system";
const indexPath = process.argv[3] ?? "storybook-static/index.json";

const entries = new Set(
  Object.keys(JSON.parse(readFileSync(indexPath, "utf8")).entries),
);

const embedRe = /<StoryEmbed[^>]*\bid="([^"]+)"/g;
const missing = [];
let total = 0;

for (const file of readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(join(docsDir, file), "utf8");
  for (const match of text.matchAll(embedRe)) {
    total += 1;
    if (!entries.has(match[1])) missing.push(`${file}: ${match[1]}`);
  }
}

console.log(`${total} embeds checked against ${entries.size} story entries`);
if (missing.length) {
  console.error("Unresolved StoryEmbed ids:");
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}
console.log("All StoryEmbed ids resolve.");
