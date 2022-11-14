import AppError from "../AppError.ts";
import { TaskModel } from "../db/models.ts";
import entity from "../db/repository/task.ts";
import { add, intervalToDuration, parseCronExpression, sub } from "../deps.ts";

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

const emptyTask:
  & Omit<
    TaskModel,
    | "id"
    | "startDate"
    | "endDate"
    | "completionDate"
    | "createdAt"
    | "updatedAt"
    | "tags"
  >
  & { tagIds: number[] } = {
    title: "",
    description: "",
    priority: 0,
    repeat: "15 */1 * * *",
    repeatType: "completionDate",
    tagIds: [],
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

type AddType = "D";

export async function done(id: number) {
  const model = await entity.getById(id);
  if (!model) {
    throw new AppError("No Task found", 400);
  }

  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    tags: _tags,
    ...previousModel
  } = model;

  let newTask: Create | undefined = undefined;

  if (model.repeat) {
    if (!model.endDate) {
      throw new AppError("Repeatable Task needs endDate", 400);
    }

    let newEndDate = null;
    let newStartDate = null;

    if (model.repeatType === "endDate") {
      const cron = parseCronExpression(model.repeat);
      newEndDate = cron.getNextDate();

      if (model.startDate) {
        const duration = intervalToDuration({
          start: model.startDate,
          end: model.endDate,
        });

        newStartDate = sub(newEndDate, duration);
      }
    } else {
      const addType = model.repeat.substring(0, 1) as AddType;
      const duration = Number(model.repeat.substring(1));

      switch (addType) {
        case "D": {
          const now = new Date();
          now.setHours(model.endDate.getHours());
          now.setMinutes(model.endDate.getMinutes());
          now.setSeconds(model.endDate.getSeconds());
          now.setMilliseconds(model.endDate.getMilliseconds());

          newEndDate = add(now, { days: duration });
          if (model.startDate) {
            const duration = intervalToDuration({
              start: model.startDate,
              end: model.endDate,
            });

            newStartDate = sub(newEndDate, duration);
          }
          if (model.startDate) {
            newStartDate = add(model.startDate, { days: duration });
          }
          break;
        }

        default:
          throw new AppError(`unknown addType: ${addType}`, 400);
      }
    }

    newTask = {
      ...previousModel,
      endDate: newEndDate,
      startDate: newStartDate,
    };

    await create(newTask);
  }

  await entity.update({
    id: _id,
    ...previousModel,
    tagIds: _tags.map((x) => x.id),
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
    tags: tags,
    ...previousModel
  } = model;

  await entity.update({
    id: _id,
    ...previousModel,
    tagIds: tags.map((x) => x.id),
    completionDate: null,
  });

  return true;
}
