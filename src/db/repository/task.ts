import { Task, TaskModel } from "../models.ts";

export async function getAll() {
  const m = await Task.all();
  return m as unknown as TaskModel[];
}

export async function getById(id: number) {
  const m = await Task.where("id", id).first();
  return m as unknown as TaskModel | undefined;
}

type Create = {
  title: TaskModel['title'];
  description?: TaskModel['description'];
  priority?: TaskModel['priority'];
  startDate?: TaskModel['startDate'];
  endDate?: TaskModel['endDate'];
  completionDate?: TaskModel['completionDate'];
  repeat?: TaskModel['repeat'];
  repeatType?: TaskModel['repeatType'];
};

export async function create(task: Create) {
  await Task.create({ ...task });
}

type Update = Partial<Create> & {
  id: TaskModel["id"];
};

export async function update({ id, ...task }: Update) {
  await Task.where("id", id).update({ ...task });
}

export async function remove(id: TaskModel["id"]) {
  await Task.deleteById(id);
}
