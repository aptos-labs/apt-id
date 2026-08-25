import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DISPLAY_NAME_MAX_LENGTH,
  formatAnsHandle,
  getDisplayName,
  resolveNameToSave,
  shouldShowAnsHandle,
  stripAptSuffix,
} from "./displayName.ts";

test("stripAptSuffix removes a trailing .apt suffix", () => {
  assert.equal(stripAptSuffix("greg.apt"), "greg");
  assert.equal(stripAptSuffix("greg.APT"), "greg");
  assert.equal(stripAptSuffix("greg"), "greg");
  assert.equal(stripAptSuffix(null), "");
  assert.equal(stripAptSuffix(undefined), "");
});

test("formatAnsHandle always presents the ANS name with .apt", () => {
  assert.equal(formatAnsHandle("greg"), "greg.apt");
  assert.equal(formatAnsHandle("greg.apt"), "greg.apt");
  assert.equal(formatAnsHandle(null), "");
});

test("getDisplayName prefers a custom on-chain name over the Aptos name", () => {
  assert.equal(getDisplayName({ name: "Greg", title: "Ignored", ansName: "greg.apt" }), "Greg");
});

test("getDisplayName uses title when name is empty", () => {
  assert.equal(getDisplayName({ name: "  ", title: "Greg Nazario", ansName: "greg" }), "Greg Nazario");
});

test("getDisplayName falls back to the Aptos name without .apt", () => {
  assert.equal(getDisplayName({ name: "", title: "", ansName: "greg.apt" }), "greg");
});

test("getDisplayName returns N/A when nothing is available", () => {
  assert.equal(getDisplayName({}), "N/A");
});

test("shouldShowAnsHandle is false when the display name matches the Aptos name", () => {
  assert.equal(shouldShowAnsHandle("greg", "greg.apt"), false);
  assert.equal(shouldShowAnsHandle("greg.apt", "greg"), false);
});

test("shouldShowAnsHandle is true when capitalization or the full title differs", () => {
  assert.equal(shouldShowAnsHandle("Greg", "greg.apt"), true);
  assert.equal(shouldShowAnsHandle("Greg Nazario", "greg"), true);
});

test("shouldShowAnsHandle is false when there is no Aptos name", () => {
  assert.equal(shouldShowAnsHandle("Greg", null), false);
});

test("resolveNameToSave keeps a custom display name", () => {
  assert.equal(resolveNameToSave("Greg", "greg.apt"), "Greg");
});

test("resolveNameToSave falls back to the Aptos name when the field is blank", () => {
  assert.equal(resolveNameToSave("   ", "greg.apt"), "greg");
  assert.equal(resolveNameToSave("", "greg"), "greg");
});

test("resolveNameToSave truncates names longer than the max length", () => {
  const tooLong = "A".repeat(DISPLAY_NAME_MAX_LENGTH + 10);
  assert.equal(resolveNameToSave(tooLong, "greg").length, DISPLAY_NAME_MAX_LENGTH);
});
