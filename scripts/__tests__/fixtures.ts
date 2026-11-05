import { onTestFinished } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";

export function factory_testDirectory(): string {
  const directory = mkdtempSync(resolve(process.env.TMPDIR ?? ".tmp", "catalog-test-"));
  onTestFinished(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}
