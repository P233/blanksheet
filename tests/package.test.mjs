import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { gzipSync } from "node:zlib";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

test("a clean npm pack builds its CSS entry and includes the migration guide", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "blanksheet-pack-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  for (const file of ["package.json", "blanksheet.css", "README.md", "CHANGELOG.md", "LICENSE"]) {
    await copyFile(join(root, file), join(directory, file));
  }
  await symlink(join(root, "node_modules"), join(directory, "node_modules"), "dir");

  const { stdout } = await exec("npm", ["pack", "--json", "--foreground-scripts=false"], {
    cwd: directory
  });
  const [artifact] = Object.values(JSON.parse(stdout));
  const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  const packedFiles = artifact.files.map((file) => file.path);

  assert.ok(packedFiles.includes(manifest.main), "main must exist in a clean tarball");
  assert.ok(packedFiles.includes(manifest.style), "style must exist in a clean tarball");
  assert.deepEqual(packedFiles.sort(), [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "blanksheet.css",
    "blanksheet.min.css",
    "package.json"
  ]);
  const minified = await readFile(join(directory, manifest.style));
  assert.ok(minified.length > 0);
  const gzipBytes = gzipSync(minified).length;
  assert.ok(gzipBytes < 1000, `README's <1KB gzip claim: received ${gzipBytes} bytes`);
  assert.ok(
    (await readFile(join(directory, "blanksheet.css"), "utf8")).includes(
      `Blanksheet v${manifest.version}`
    ),
    "source header and package version must agree"
  );
});
