import { expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { factory_testDirectory } from "./fixtures";

const runner = resolve(import.meta.dir, "../test-run.sh");

test.each([0, 42])("removes owned scratch and preserves exit %i", async (exitCode) => {
  const root = factory_testDirectory();
  await Bun.write(`${root}/sentinel`, "keep");
  const result = Bun.spawnSync(
    ["bash", runner, "bash", "-c", 'echo evidence > "$TMPDIR/evidence"; exit "$1"', "fixture", String(exitCode)],
    { cwd: root, env: { ...process.env, TMPDIR: root } },
  );
  expect(result.exitCode).toBe(exitCode);
  expect(await readdir(root)).toEqual(["sentinel"]);
  expect(await Bun.file(`${root}/sentinel`).text()).toBe("keep");
});

test("stops child processes before removing scratch on cancellation", async () => {
  const root = factory_testDirectory();
  const result = Bun.spawnSync(
    [
      "bash",
      runner,
      "bash",
      "-c",
      `set -eu
echo evidence > "$TMPDIR/evidence"
trap 'test -f "$TMPDIR/evidence" && echo stopped > "$PWD/stopped"; exit 0' TERM
mkfifo "$TMPDIR/wait"
cat "$TMPDIR/wait" &
kill -TERM "$PPID"
wait`,
    ],
    { cwd: root, env: { ...process.env, TMPDIR: root } },
  );
  expect(result.exitCode).toBe(143);
  expect(await readdir(root)).toEqual(["stopped"]);
  expect(await Bun.file(`${root}/stopped`).text()).toBe("stopped\n");
});

test("isolates nested concurrent runs", async () => {
  const root = factory_testDirectory();
  await Bun.write(`${root}/sentinel`, "keep");
  const result = Bun.spawnSync(
    [
      "bash",
      runner,
      "bash",
      "-c",
      `set -eu
echo parent > "$TMPDIR/parent"
bash "$1" bash -c 'echo first > "$TMPDIR/first"' &
first=$!
bash "$1" bash -c 'echo second > "$TMPDIR/second"' &
second=$!
wait "$first"
wait "$second"
test "$(cat "$TMPDIR/parent")" = parent`,
      "fixture",
      runner,
    ],
    { cwd: root, env: { ...process.env, TMPDIR: root } },
  );
  expect(result.exitCode).toBe(0);
  expect(await readdir(root)).toEqual(["sentinel"]);
  expect(await Bun.file(`${root}/sentinel`).text()).toBe("keep");
});
