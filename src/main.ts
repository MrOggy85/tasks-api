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

console.log(
  "AUTH_HEADER",
  `${getEnv("AUTH_HEADER").substring(0, 2)}***${
    getEnv("AUTH_HEADER").substring(getEnv("AUTH_HEADER").length - 3)
  }`,
);

const HOST = getEnv("HTTP_HOST") || "0.0.0.0";
const HTTP_PORT = getEnv("HTTP_PORT");
const PORT = HTTP_PORT ? Number(HTTP_PORT) : 8000;

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
console.log(`Server is listening on: ${HOST}:${PORT}`);
await app.listen({ hostname: HOST, port: PORT });
