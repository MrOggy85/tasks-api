import { Tag, TagModel } from "../models.ts";

export async function getAll() {
  const entity = await Tag.all();
  return entity as unknown as TagModel[];
}

export async function getById(id: number) {
  const m = await Tag.where("id", id).first();
  return m as unknown as TagModel | undefined;
}

type Create = {
  name: TagModel["name"];
  bgColor: TagModel["bgColor"];
  textColor: TagModel["textColor"];
};

export async function create(task: Create) {
  await Tag.create({
    ...task,
  });
}

type Update = Partial<Create> & {
  id: TagModel["id"];
};

export async function update({ id, ...task }: Update) {
  await Tag.where("id", id).update({
    ...task,
  });
}

export async function remove(id: TagModel["id"]) {
  await Tag.deleteById(id);
}
