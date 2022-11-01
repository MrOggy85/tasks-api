type KEY =
  | "DB_USER"
  | "DB_PASSWORD"
  | "DB_NAME"
  | "DB_HOST"
  | "DB_PORT"
  | "RUN_DIAGNOSTICS"
  | "DB_LOG_QUERY"
  | "AUTH_HEADER"
  | "CORS_ORIGINS";

function getEnv(key: KEY) {
  return Deno.env.get(key) || "";
}

export default getEnv;
