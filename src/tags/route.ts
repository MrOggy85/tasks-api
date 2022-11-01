import AppError from "../AppError.ts";
import { Context, Router, RouterContext } from "../deps.ts";
import { getIdParamAsNumber } from "../routeValidation.ts";
import * as handler from "./handler.ts";

const ROUTE = "/tags";

async function getAll(ctx: Context) {
  const models = await handler.getAll();

  ctx.response.body = models;
}

type GetByIdContext = RouterContext<"/tags/:id", { id: string }>;
async function getById(ctx: GetByIdContext) {
  const id = getIdParamAsNumber(ctx.params.id);

  const model = await handler.getById(Number(id));
  ctx.response.body = model;
}

type InsertModel = Parameters<typeof handler["create"]>[0];

async function insert(ctx: Context) {
  const result = ctx.request.body({
    type: "json",
  });
  const { name, bgColor, textColor }: InsertModel = await result
    .value as InsertModel;
  if (!name) {
    throw new AppError("'name' is empty", 400);
  }
  if (!bgColor) {
    throw new AppError("'bgColor' is empty", 400);
  }
  if (!textColor) {
    throw new AppError("'textColor' is empty", 400);
  }

  await handler.create({
    name,
    bgColor,
    textColor,
  });

  ctx.response.body = true;
}

type UpdateModel = InsertModel & {
  id?: string;
};

async function update(ctx: Context) {
  const result = ctx.request.body({
    type: "json",
  });
  const { id, name, bgColor, textColor }: UpdateModel = await result.value;
  const idAsNumber = getIdParamAsNumber(id);

  if (!name) {
    throw new AppError('"name" is empty', 400);
  }

  handler.update({
    id: idAsNumber,
    name,
    bgColor,
    textColor,
  });

  ctx.response.body = true;
}

type RemoveContext = RouterContext<"/tags/:id", { id: string }>;
async function remove(ctx: RemoveContext) {
  const id = getIdParamAsNumber(ctx.params.id);

  await handler.remove(id);

  ctx.response.body = true;
}

function init(router: Router) {
  router
    .get(ROUTE, getAll)
    .get(`${ROUTE}/:id`, getById)
    .post(`${ROUTE}`, insert)
    .put(`${ROUTE}`, update)
    .delete(`${ROUTE}/:id`, remove);
}

export default init;
