import { Database, PostgresConnector } from "../deps.ts";
import getEnv from "../getEnv.ts";
import { Tag, TagTask, Task } from "./models.ts";

const DB_USER = getEnv("DB_USER");
const DB_PASSWORD = getEnv("DB_PASSWORD");
const DB_NAME = getEnv("DB_NAME");
const DB_HOST = getEnv("DB_HOST");
const DB_PORT = Number(getEnv("DB_PORT"));

console.log("DB_USER", DB_USER);
console.log(
  "DB_PASSWORD",
  `${DB_PASSWORD.substring(0, 2)}***${
    DB_PASSWORD.substring(DB_PASSWORD.length - 3)
  }`,
);
console.log("DB_HOST", DB_HOST);
console.log("DB_NAME", DB_NAME);
console.log("DB_PORT", DB_PORT);

function initDb() {
  const connector = new PostgresConnector({
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
  });

  const db = new Database({
    connector,
    debug: false,
  });

  db.link([
    Task,
    Tag,
    TagTask,
  ]);

  // await db.sync({ drop: true, truncate: false });
}

export default initDb;
