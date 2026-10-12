import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Pinned files are fetched from jsDelivr once and reused, so reruns compare the same bytes.
export async function fetchPackageFile(spec, file) {
  const cached = new URL(`.cache/${spec}/${file}`, import.meta.url);
  try {
    return await readFile(cached, "utf8");
  } catch {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/${spec}/${file}`);
    if (!response.ok) throw new Error(`${spec}/${file}: HTTP ${response.status}`);
    const text = await response.text();
    await mkdir(dirname(fileURLToPath(cached)), { recursive: true });
    await writeFile(cached, text);
    return text;
  }
}

// Tailwind resolves --theme() at build time and imports Preflight into @layer base.
export const asTailwindBuilds = (css) =>
  `@layer base {\n${css.replace(/--theme\(\s*--[\w-]+,\s*(.*?)\)\s*;/gs, "$1;")}\n}`;
