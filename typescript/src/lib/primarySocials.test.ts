import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PRIMARY_SOCIAL_PREFIX,
  buildPrimarySocialUpdates,
  extractPrimarySocialHandle,
  splitProfileLinks,
  toPrimarySocialUrl,
} from "./primarySocials.ts";

test("splitProfileLinks separates prefixed socials from regular links", () => {
  const { regularLinks, primarySocials } = splitProfileLinks([
    { id: "Website", title: "Website", url: "https://example.com" },
    { id: `${PRIMARY_SOCIAL_PREFIX}x`, title: `${PRIMARY_SOCIAL_PREFIX}x`, url: "https://x.com/aptoslabs" },
    {
      id: `${PRIMARY_SOCIAL_PREFIX}github`,
      title: `${PRIMARY_SOCIAL_PREFIX}github`,
      url: "https://github.com/aptos-labs",
    },
  ]);

  assert.deepEqual(regularLinks, [{ id: "Website", title: "Website", url: "https://example.com" }]);
  assert.deepEqual(primarySocials, {
    x: "https://x.com/aptoslabs",
    github: "https://github.com/aptos-labs",
  });
});

test("splitProfileLinks returns empty maps for empty input", () => {
  assert.deepEqual(splitProfileLinks([]), { regularLinks: [], primarySocials: {} });
});

test("toPrimarySocialUrl builds a platform URL and strips a leading @", () => {
  assert.equal(toPrimarySocialUrl("x", "@aptoslabs"), "https://x.com/aptoslabs");
  assert.equal(toPrimarySocialUrl("telegram", "aptos"), "https://t.me/aptos");
  assert.equal(toPrimarySocialUrl("github", "aptos-labs"), "https://github.com/aptos-labs");
});

test("toPrimarySocialUrl keeps an already-absolute URL", () => {
  assert.equal(toPrimarySocialUrl("x", "https://x.com/aptoslabs"), "https://x.com/aptoslabs");
});

test("extractPrimarySocialHandle recovers handles from stored URLs", () => {
  assert.equal(extractPrimarySocialHandle("x", "https://x.com/aptoslabs"), "aptoslabs");
  assert.equal(extractPrimarySocialHandle("x", "https://twitter.com/aptoslabs"), "aptoslabs");
  assert.equal(extractPrimarySocialHandle("telegram", "https://t.me/aptos"), "aptos");
  assert.equal(extractPrimarySocialHandle("github", "aptos-labs"), "aptos-labs");
});

test("buildPrimarySocialUpdates upserts filled handles and removes cleared ones", () => {
  const result = buildPrimarySocialUpdates(
    { x: "@aptoslabs", telegram: "", github: "aptos-labs" },
    { x: "https://x.com/old", telegram: "https://t.me/old" },
  );

  assert.deepEqual(result.toUpsert, {
    names: [`${PRIMARY_SOCIAL_PREFIX}x`, `${PRIMARY_SOCIAL_PREFIX}github`],
    urls: ["https://x.com/aptoslabs", "https://github.com/aptos-labs"],
  });
  assert.deepEqual(result.toRemove, [`${PRIMARY_SOCIAL_PREFIX}telegram`]);
});
