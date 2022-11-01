import AppError from "../AppError.ts";
import * as entity from "../db/repository/tag.ts";

export async function getAll() {
  const models = await entity.getAll();
  return models;
}

export async function getById(id: number) {
  const model = await entity.getById(id);
  if (!model) {
    throw new AppError("No Tag found", 400);
  }
  return model;
}

type Create = Parameters<typeof entity["create"]>[0];

export async function create(tag: Create) {
  await entity.create({
    ...tag,
  });

  return true;
}

type Update = Partial<Create> & {
  id: number;
};

export async function update(tag: Update) {
  const model = await entity.getById(tag.id);
  if (!model) {
    throw new AppError("No Tag found", 400);
  }

  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...previousModel
  } = model;

  await entity.update({
    ...previousModel,
    ...tag,
  });

  return true;
}

export async function remove(id: number) {
  await entity.remove(id);

  return true;
}
