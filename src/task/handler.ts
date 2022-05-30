import AppError from "../AppError.ts";
import { TaskModel } from "../db/models.ts";
import * as entity from "../db/repository/task.ts";

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

type Create = Parameters<typeof entity['create']>[0];

const emptyTask: Omit<TaskModel, "id"> = {
  title: '',
  description: '',
  priority: 0,
  repeat: '',
}

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
    ...task
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

  await entity.update({
    ...model,
    completionDate: new Date() as unknown as string,
  });

  return true;
}
