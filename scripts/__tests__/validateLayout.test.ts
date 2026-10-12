import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { validateLayout } from "../validateLayout";

let rootPath: string;

beforeEach(async () => {
  await mkdir(".tmp/layout-tests", { recursive: true });
  rootPath = await mkdtemp(resolve(".tmp/layout-tests/catalog-"));
});

afterEach(async () => {
  await rm(rootPath, { recursive: true, force: true });
});

test("accepts sharded tools, one-character IDs and companion files", async () => {
  await Bun.write(`${rootPath}/f/z/fzf/tool.ts`, "export default 1;");
  await Bun.write(`${rootPath}/x/_/x/tool.ts`, "export default 1;");
  await Bun.write(`${rootPath}/f/z/fzf/config/theme.toml`, "color = 'blue'");
  expect(await validateLayout(rootPath)).toEqual(["f/z/fzf/tool.ts", "x/_/x/tool.ts"]);
});

test.each([
  ["z/z/fzf/tool.ts", "z/z/fzf: expected f/z/fzf"],
  ["x/x/x/tool.ts", "x/x/x: expected x/_/x"],
  ["f/z/Fzf/tool.ts", "f/z/Fzf: invalid catalog ID Fzf"],
  ["c/o/con/tool.ts", "c/o/con: invalid catalog ID con"],
  ["l/p/lpt1/tool.ts", "l/p/lpt1: invalid catalog ID lpt1"],
  ["f/z/fzf-/tool.ts", "f/z/fzf-: invalid catalog ID fzf-"],
  ["fzf.tool.ts", "fzf.tool.ts: expected a shard directory"],
  ["f/README.md", "f/README.md: expected a shard directory"],
  ["f/z/fzf", "f/z/fzf: expected a tool directory"],
  ["f/z/fzf/config.toml", "f/z/fzf: missing tool.ts"],
  ["f/z/fzf/fzf.tool.ts", "f/z/fzf/fzf.tool.ts: additional .tool.ts definition"],
  ["f/z/fzf/config/.git/config", "f/z/fzf/config/.git: unsafe path"],
  ["f/z/fzf/config/file?.toml", "f/z/fzf/config/file?.toml: unsafe path"],
  ["f/z/fzf/config/nul.txt", "f/z/fzf/config/nul.txt: unsafe path"],
  ["f/z/fzf/config/file. ", "f/z/fzf/config/file. : unsafe path"],
  ["f/z/fzf/config/file\n.toml", "f/z/fzf/config/file\n.toml: unsafe path"],
])("rejects %s", async (filePath, message) => {
  await Bun.write(`${rootPath}/${filePath}`, "data");
  const result = await validateLayout(rootPath).catch((error: Error) => error.message);
  expect(result).toBe(message);
});

test("rejects an empty catalog", async () => {
  expect(await validateLayout(rootPath).catch((error: Error) => error.message)).toBe("catalog contains no tools");
});

test("rejects case-colliding companion paths", async () => {
  await Bun.write(`${rootPath}/f/z/fzf/tool.ts`, "export default 1;");
  await Bun.write(`${rootPath}/f/z/fzf/config/A.toml`, "a");
  await Bun.write(`${rootPath}/f/z/fzf/config/a.toml`, "a");
  expect(await validateLayout(rootPath).catch((error: Error) => error.message)).toBe(
    "f/z/fzf/config/a.toml: case-colliding path",
  );
});

test("rejects symlinks without following them", async () => {
  await mkdir(`${rootPath}/f/z/fzf`, { recursive: true });
  const link = Bun.spawn(["ln", "-s", rootPath, `${rootPath}/f/z/fzf/link`]);
  expect(await link.exited).toBe(0);
  expect(await validateLayout(rootPath).catch((error: Error) => error.message)).toBe(
    "f/z/fzf/link: only regular files and directories are allowed",
  );
});

test("rejects a symlink replacing the tools root", async () => {
  const link = Bun.spawn(["ln", "-s", rootPath, `${rootPath}/link`]);
  expect(await link.exited).toBe(0);
  expect(await validateLayout(`${rootPath}/link`).catch((error: Error) => error.message)).toBe(
    `${rootPath}/link: expected a real tools directory`,
  );
});
