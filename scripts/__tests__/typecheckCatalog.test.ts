import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { typecheckCatalog } from "../typecheckCatalog";

const sdkPath = resolve(".tmp/installer/.dist");
const compilerPath = resolve("node_modules/.bin/tsc");
let rootPath: string;

beforeEach(async () => {
  await mkdir(".tmp/typecheck-tests", { recursive: true });
  rootPath = await mkdtemp(resolve(".tmp/typecheck-tests/catalog-"));
});

afterEach(async () => {
  await rm(rootPath, { recursive: true, force: true });
});

test("typechecks a definition against the real SDK without executing it", async () => {
  await Bun.write(
    `${rootPath}/tools/x/_/x/tool.ts`,
    [
      'import { defineTool } from "@alexgorbatchev/dotfiles";',
      'export default defineTool(install => install("github-release", { repo: "owner/tool" }).bin("x"));',
      'throw new Error("definitions must not execute during typechecking");',
    ].join("\n"),
  );
  expect(await typecheckCatalog(rootPath, sdkPath, compilerPath, ["x/_/x/tool.ts"])).toEqual({
    exitCode: 0,
    stdout: "",
    stderr: "",
  });
});

test.each([
  [
    'import { defineTool } from "@alexgorbatchev/dotfiles"; export default defineTool(install => install().notARealMethod());',
    "tools/x/_/x/tool.ts(1,103): error TS2339: Property 'notARealMethod' does not exist on type 'IToolConfigBuilder'.\n",
  ],
  [
    'import { defineTool } from "@alexgorbatchev/dotfiles"; export default defineTool(install => install("github-release", { repo: 42 }));',
    "tools/x/_/x/tool.ts(1,121): error TS2322: Type 'number' is not assignable to type 'string'.\n",
  ],
  [
    'export default Bun.file("bad");',
    "tools/x/_/x/tool.ts(1,16): error TS2868: Cannot find name 'Bun'. Do you need to install type definitions for Bun? Try `npm i --save-dev @types/bun` and then add 'bun' to the types field in your tsconfig.\n",
  ],
  [
    "export default process.platform;",
    "tools/x/_/x/tool.ts(1,24): error TS2339: Property 'platform' does not exist on type 'IRuntimeProcess'.\n",
  ],
])("rejects invalid types and unavailable runtime APIs: %s", async (source, stdout) => {
  await Bun.write(`${rootPath}/tools/x/_/x/tool.ts`, source);
  const result = await typecheckCatalog(rootPath, sdkPath, compilerPath, ["x/_/x/tool.ts"]);
  expect(result).toEqual({ exitCode: 1, stdout, stderr: "" });
});

test("includes companion TypeScript files in the compiler program", async () => {
  await Bun.write(`${rootPath}/tools/x/_/x/tool.ts`, "export default 1;");
  await Bun.write(`${rootPath}/tools/x/_/x/helper.ts`, 'export const value: number = "bad";');
  const result = await typecheckCatalog(rootPath, sdkPath, compilerPath, ["x/_/x/helper.ts", "x/_/x/tool.ts"]);
  expect(result.exitCode).toBe(1);
  expect(result.stdout).toBe(
    "tools/x/_/x/helper.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.\n",
  );
});

test("fails when canonical SDK declarations are missing", async () => {
  expect(await typecheckCatalog(rootPath, rootPath, compilerPath, []).catch((error: Error) => error.message)).toBe(
    `SDK declarations are missing at ${rootPath}; prepare the pinned installer SDK first`,
  );
});
