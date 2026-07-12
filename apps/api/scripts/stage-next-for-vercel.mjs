import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(scriptDir, "..");
const repoRoot = join(apiRoot, "..", "..");
const webRoot = join(repoRoot, "apps", "web");

const STAGE_DIRS = ["app", "components", "hooks", "lib", "public", "types"];
const STAGE_FILES = [
  "components.json",
  "next-env.d.ts",
  "next.config.ts",
  "postcss.config.mjs",
  "tailwind.config.ts",
  "tsconfig.json",
];

function replaceDir(target, source) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
  cpSync(source, target, { recursive: true });
}

const pythonAppDir = join(apiRoot, "app");
const pythonAppBackup = join(apiRoot, "_fastapi_app");

if (existsSync(pythonAppDir) && existsSync(join(pythonAppDir, "main.py"))) {
  replaceDir(pythonAppBackup, pythonAppDir);
}

for (const dir of STAGE_DIRS) {
  const source = join(webRoot, dir);
  if (existsSync(source)) {
    replaceDir(join(apiRoot, dir), source);
  }
}

for (const file of STAGE_FILES) {
  const source = join(webRoot, file);
  const target = join(apiRoot, file);
  if (existsSync(source)) {
    cpSync(source, target);
  }
}

replaceDir(join(apiRoot, ".next"), join(webRoot, ".next"));

mkdirSync(join(apiRoot, "node_modules"), { recursive: true });

console.log("Staged Next.js build from apps/web into apps/api for Vercel.");
