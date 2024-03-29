import {
  Application,
  ConnectionError,
  Context,
  oakCors,
  PostgresError,
  Router,
} from "./deps.ts";
import initTaskRoutes from "./task/route.ts";
import initTagsRoutes from "./tags/route.ts";
import AppError from "./AppError.ts";
import initDb from "./db/initDb.ts";
import getEnv from "./getEnv.ts";

function logger(ctx: Context) {
  console.log(
    `[${ctx.request.ip}] ${ctx.request.method} ${ctx.request.url} - ${ctx.response.status}`,
  );
}

function initServer() {
  const app = new Application({
    proxy: true,
  });

  app.addEventListener("error", (evt) => {
    console.error(evt.error);
  });

  const corsRaw = getEnv("CORS_ORIGINS");
  const origin = corsRaw.split(",");
  console.log("origin", origin);

  app.use(
    oakCors({
      origin,
    }),
  );

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof PostgresError) {
        console.log("PostgresError!");
        const postgresError = err as PostgresError;
        ctx.response.status = 400;
        ctx.response.body = postgresError.message;
        return;
      }

      if (err instanceof AppError) {
        const appError = err as AppError;
        ctx.response.status = appError.status;
        ctx.response.body = appError.message;
        return;
      }

      if (err instanceof ConnectionError) {
        console.log("ConnectionError");
        // e.g. The session was terminated by the database
        await initDb();
      }
      if (err instanceof Deno.errors.BrokenPipe) {
        console.log("BrokenPipe");
        await initDb();
      }

      console.error(err);
      ctx.response.status = 500;
      ctx.response.body = "Internal Server Error";
    } finally {
      logger(ctx);
    }
  });

  app.use(async (ctx, next) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (authHeader === getEnv("AUTH_HEADER")) {
      await next();
    } else {
      throw new AppError("unauthorized", 401);
    }
  });

  const router = new Router();
  router
    .get("/", (context) => {
      context.response.body = "Hello world!";
    });

  initTaskRoutes(router);
  initTagsRoutes(router);

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

export default initServer;
