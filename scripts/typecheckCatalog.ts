import { join } from "node:path";

interface TypecheckResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function typecheckCatalog(
  rootPath: string,
  sdkPath: string,
  compilerPath: string,
  files: string[],
): Promise<TypecheckResult> {
  const indexPath = join(sdkPath, "index.d.ts");
  const globalsPath = join(sdkPath, "globals.d.ts");
  if (!(await Bun.file(indexPath).exists()) || !(await Bun.file(globalsPath).exists())) {
    throw new Error(`SDK declarations are missing at ${sdkPath}; prepare the pinned installer SDK first`);
  }
  const configPath = join(rootPath, ".tmp/catalog-tsconfig.json");
  await Bun.write(
    configPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: "ESNext",
          module: "ESNext",
          moduleResolution: "bundler",
          lib: ["ESNext"],
          types: [],
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          allowImportingTsExtensions: true,
          paths: { "@alexgorbatchev/dotfiles": [indexPath] },
        },
        files: [indexPath, globalsPath, ...files.map((path) => join(rootPath, "tools", path))],
      },
      null,
      2,
    ),
  );
  const compiler = Bun.spawn([compilerPath, "--project", configPath, "--pretty", "false"], {
    cwd: rootPath,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    compiler.exited,
    new Response(compiler.stdout).text(),
    new Response(compiler.stderr).text(),
  ]);
  return { exitCode, stdout, stderr };
}
