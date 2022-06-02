import AppError from "../AppError.ts";
import { TaskModel } from "../db/models.ts";
import * as entity from "../db/repository/task.ts";
import { parseCronExpression } from "../deps.ts";

export async function getAll() {
  const models = await entity.getAll();
  return models;
}

export async function getById(id: number) {
  const model = await entity.getById(id);
  if (!model) {
    throw new AppError("No Task found", 400);
  }
  return model;
}

type Create = Parameters<typeof entity["create"]>[0];

const emptyTask: Omit<
  TaskModel,
  "id" | "startDate" | "endDate" | "completionDate" | "createdAt" | "updatedAt"
> = {
  title: "",
  description: "",
  priority: 0,
  repeat: "15 */1 * * *",
  repeatType: "completionDate",
};

export async function create(task: Create) {
  await entity.create({
    ...emptyTask,
    ...task,
  });

  return true;
}

type Update = Partial<Create> & {
  id: number;
};

export async function update(task: Update) {
  await entity.update({
    ...task,
  });

  return true;
}

export async function remove(id: number) {
  await entity.remove(id);

  return true;
}

export async function done(id: number) {
  const model = await entity.getById(id);
  if (!model) {
    throw new AppError("No Task found", 400);
  }

  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...previousModel
  } = model;

  let newTask: Create | undefined = undefined;

  if (model.repeat) {
    const cron = parseCronExpression(model.repeat);
    const fromDate = model.repeatType === "endDate" ? model.endDate : undefined;
    const endDate = cron.getNextDate(fromDate || undefined);

    newTask = {
      ...previousModel,
      endDate,
    };

    await create(newTask);
  }

  await entity.update({
    id: _id,
    ...previousModel,
    completionDate: new Date(),
  });

  return newTask;
}

export async function unDone(id: number) {
  const model = await entity.getById(id);
  if (!model) {
    throw new AppError("No Task found", 400);
  }

  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...previousModel
  } = model;
  await entity.update({
    id: _id,
    ...previousModel,
    completionDate: null,
  });

  return true;
}
