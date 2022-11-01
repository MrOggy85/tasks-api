import { printDiagnostic } from "./debug/diagnostics.ts";
import initDb from "./db/initDb.ts";
import initServer from "./server.ts";
import getEnv from "./getEnv.ts";

if (getEnv("RUN_DIAGNOSTICS") === "1") {
  printDiagnostic();
}

type KEY = Parameters<typeof getEnv>[0];

const mandatoryEnvVars: KEY[] = [
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
  "DB_USER",
  "AUTH_HEADER",
];
mandatoryEnvVars.forEach((x) => {
  if (!getEnv(x)) {
    throw new Error(`Env var: ${x} not set!`);
  }
});

// Deno Deploy Env vars
console.log("DENO_REGION", Deno.env.get("DENO_REGION"));
console.log("DENO_DEPLOYMENT_ID", Deno.env.get("DENO_DEPLOYMENT_ID"));

console.time("time");
console.log("");
console.log("Initializing Database...");
await initDb();
console.timeEnd("time");
console.log("DONE");

console.log("");
console.time("time");
console.log("Initializing Oak Server...");
const app = initServer();
console.timeEnd("time");
console.log("DONE");

console.log("");
console.log("Server is listening on port 8000");
await app.listen({ port: 8000 });
