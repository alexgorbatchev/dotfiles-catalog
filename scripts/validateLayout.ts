import { lstat, readdir } from "node:fs/promises";
import { join } from "node:path";

function isReservedName(name: string): boolean {
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name);
}

function isUnsafePathPart(part: string): boolean {
  return (
    /^\.git$/i.test(part) ||
    isReservedName(part) ||
    /[\\:<>"|?*]|[. ]$/.test(part) ||
    Array.from(part).some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || (code >= 127 && code <= 159);
    })
  );
}

export async function validateLayout(toolsPath: string): Promise<string[]> {
  if (!(await lstat(toolsPath)).isDirectory()) {
    throw new Error(`${toolsPath}: expected a real tools directory`);
  }
  const files: string[] = [];
  const toolDirectories: string[] = [];
  const seen = new Set<string>();

  async function walk(relativePath: string): Promise<void> {
    const entries = await readdir(join(toolsPath, relativePath), { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : 1));
    for (const entry of entries) {
      const path = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (!entry.isDirectory() && !entry.isFile()) {
        throw new Error(`${path}: only regular files and directories are allowed`);
      }
      if (seen.has(path.toLowerCase())) {
        throw new Error(`${path}: case-colliding path`);
      }
      seen.add(path.toLowerCase());
      const parts = path.split("/");
      if (parts.length < 3) {
        const pattern = parts.length === 1 ? /^[a-z0-9]$/ : /^[a-z0-9_-]$/;
        if (!entry.isDirectory() || !pattern.test(entry.name)) {
          throw new Error(`${path}: expected a shard directory`);
        }
      } else {
        const id = parts[2];
        if (!id || !/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(id) || isReservedName(id)) {
          throw new Error(`${path}: invalid catalog ID ${id}`);
        }
        const expected = `${id[0]}/${id[1] ?? "_"}/${id}`;
        if (parts.slice(0, 3).join("/") !== expected) {
          throw new Error(`${path}: expected ${expected}`);
        }
        if (parts.length === 3) {
          if (!entry.isDirectory()) {
            throw new Error(`${path}: expected a tool directory`);
          }
          toolDirectories.push(path);
        }
        if (parts.some(isUnsafePathPart)) {
          throw new Error(`${path}: unsafe path`);
        }
        if (entry.isFile() && path.toLowerCase().endsWith(".tool.ts")) {
          throw new Error(`${path}: additional .tool.ts definition`);
        }
      }
      if (entry.isDirectory()) {
        await walk(path);
      } else {
        files.push(path);
      }
    }
  }

  await walk("");
  if (toolDirectories.length === 0) {
    throw new Error("catalog contains no tools");
  }
  for (const directory of toolDirectories) {
    if (!files.includes(`${directory}/tool.ts`)) {
      throw new Error(`${directory}: missing tool.ts`);
    }
  }
  return files.filter((path) => /\.tsx?$/.test(path));
}
