import { Task, TaskModel, TagTask, Tag, TagModel } from "../models.ts";

async function createTagTasks(
  tagIds: number[],
  taskId: TaskModel["id"],
) {
  const promises = tagIds.map((tagId) => {
    return TagTask.create({
      tagId,
      taskId,
    });
  });
  await Promise.all(promises);
}

async function removeTagTasksByTaskId(
  taskId: TaskModel["id"],
) {
  await TagTask.where({
    taskId,
  }).delete();
}

async function getTags(taskId: number) {
  const tags = await Tag
    .select(Tag.field('id'), Tag.field('name'), Tag.field('bg_color'), Tag.field('text_color'))
    .join(TagTask, TagTask.field("tag_id"), Tag.field("id"))
    .where(TagTask.field("task_id"), taskId)
    .get();
  return tags as unknown as TagModel[];
}

async function getTaskWithTags(task: TaskModel) {
  const tags = await getTags(task.id);
  return {
    ...task,
    tags,
  };
}

export async function getAll() {
  const m = await Task.all() as unknown as TaskModel[];

  const promises = m.map((x) => {
    return getTaskWithTags(x);
  });

  const mWithTags = Promise.all(promises);

  return mWithTags;
}

export async function getById(id: number) {
  const m = await Task
    .where(Task.field("id"), id)
    .first();

  const tags = await getTags(id);

  return {
    ...m,
    tags,
  } as unknown as TaskModel | undefined;
}

type Create = {
  title: TaskModel["title"];
  description?: TaskModel["description"];
  priority?: TaskModel["priority"];
  startDate?: TaskModel["startDate"];
  endDate?: TaskModel["endDate"];
  completionDate?: TaskModel["completionDate"];
  repeat?: TaskModel["repeat"];
  repeatType?: TaskModel["repeatType"];
  tagIds?: number[];
};

export async function create(task: Create) {
  const { tagIds, ...t } = task;
  const { id } = await Task.create({ ...t });
  await createTagTasks(tagIds || [], id as number);
}

type Update = Partial<Create> & {
  id: TaskModel["id"];
};

export async function update({ id, ...task }: Update) {
  const { tagIds, ...t } = task;
  await Task.where("id", id).update({ ...t });

  await removeTagTasksByTaskId(id);
  await createTagTasks(tagIds || [], id as number);
}

export async function remove(id: TaskModel["id"]) {
  await removeTagTasksByTaskId(id);
  await Task.deleteById(id);
}
