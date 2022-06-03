import AppError from "../AppError.ts";
import { Context, Router, RouterContext } from "../deps.ts";
import { getIdParamAsNumber } from "../routeValidation.ts";
import * as handler from "./handler.ts";

const ROUTE = "/tasks";

async function getAll(ctx: Context) {
  const models = await handler.getAll();

  ctx.response.body = models;
}

type GetByIdContext = RouterContext<"/tasks/:id", { id: string; }>;
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
  const {
    title,
    description,
    priority,
    startDate,
    endDate,
    repeat,
    repeatType,
    tagIds,
  }: InsertModel = await result.value as InsertModel;
  if (!title) {
    throw new AppError("'title' is empty", 400);
  }

  await handler.create({
    title,
    description: description || "",
    priority: priority || 0,
    startDate,
    endDate,
    repeat: repeat || "",
    repeatType: repeatType || "completionDate",
    tagIds,
  });

  ctx.response.body = true;
}

type UpdateModel = Partial<InsertModel> & {
  id?: string;
};

async function update(ctx: Context) {
  const result = ctx.request.body({
    type: "json",
  });
  const { id, title, description, priority, startDate, endDate, repeat, repeatType }:
    UpdateModel = await result.value;
  const idAsNumber = getIdParamAsNumber(id);

  await handler.getById(idAsNumber);

  handler.update({
    id: idAsNumber,
    title,
    description,
    priority,
    startDate,
    endDate,
    repeat,
    repeatType,
  });

  ctx.response.body = true;
}

type RemoveContext = RouterContext<"/tasks/:id", { id: string; }>;
async function remove(ctx: RemoveContext) {
  const id = getIdParamAsNumber(ctx.params.id);

  await handler.remove(id);

  ctx.response.body = true;
}

type DoneContext = RouterContext<"/tasks/:id/done", { id: string; }>;
async function done(ctx: DoneContext) {
  const id = getIdParamAsNumber(ctx.params.id);

  const result = await handler.done(id);

  ctx.response.body = result;
}

type UnDoneContext = RouterContext<"/tasks/:id/undone", { id: string; }>;
async function unDone(ctx: UnDoneContext) {
  const id = getIdParamAsNumber(ctx.params.id);
  const result = await handler.unDone(id);
  ctx.response.body = result;
}

function init(router: Router) {
  router
    .get(ROUTE, getAll)
    .get(`${ROUTE}/:id`, getById)
    .post(`${ROUTE}`, insert)
    .post(`${ROUTE}/:id/done`, done)
    .post(`${ROUTE}/:id/undone`, unDone)
    .put(`${ROUTE}`, update)
    .delete(`${ROUTE}/:id`, remove);
}

export default init;
