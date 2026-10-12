import { resolve } from "node:path";
import { typecheckCatalog } from "./typecheckCatalog";
import { validateLayout } from "./validateLayout";

try {
  const files = await validateLayout(resolve("tools"));
  console.log(`Catalog layout valid; checking ${files.length} TypeScript files`);
  const result = await typecheckCatalog(
    process.cwd(),
    resolve(".tmp/installer/.dist"),
    resolve("node_modules/.bin/tsc"),
    files,
  );
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
