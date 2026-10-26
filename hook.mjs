#!/usr/bin/env node
// pre-commit installs this repository as a package, so the hook runs the
// CLI from the @deliverd/screen it depends on, with the files it is given.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = join(dirname(fileURLToPath(import.meta.resolve("@deliverd/screen"))), "cli.js");
const run = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(run.status ?? 2);
