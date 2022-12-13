import AppError from "../AppError.ts";
import { TaskModel } from "../db/models.ts";
import entity from "../db/repository/task.ts";
import {
  add,
  intervalToDuration,
  isAfter,
  parseCronExpression,
  sub,
} from "../deps.ts";

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
  const id = await entity.create({
    ...emptyTask,
    ...task,
  });

  return id;
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
    completionDate: _completionDate,
    tags: _tags,
    ...previousModel
  } = model;

  if (_completionDate) {
    throw new AppError("Task already done", 400);
  }

  let newTask: Create | undefined = undefined;

  if (model.repeat) {
    if (!model.endDate) {
      throw new AppError("Repeatable Task needs endDate", 400);
    }

    let newEndDate = null;
    let newStartDate = null;

    if (model.repeatType === "endDate") {
      let now = new Date();
      if (isAfter(now, model.endDate)) {
        now = sub(now, { days: 1 });
      }
      const cron = parseCronExpression(model.repeat);
      newEndDate = cron.getNextDate(now);
      newEndDate.setUTCHours(model.endDate.getUTCHours());
      newEndDate.setMinutes(model.endDate.getMinutes());
      newEndDate.setSeconds(model.endDate.getSeconds());
      newEndDate.setMilliseconds(model.endDate.getMilliseconds());

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
          let now = new Date();
          if (isAfter(now, model.endDate)) {
            now = sub(now, { days: 1 });
          }

          now.setUTCHours(model.endDate.getUTCHours());
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
          break;
        }

        default:
          throw new AppError(`unknown addType: ${addType}`, 400);
      }
    }

    newTask = {
      ...previousModel,
      endDate: newEndDate.toISOString(),
      startDate: newStartDate?.toISOString(),
    };

    await create(newTask);
  }

  const {
    startDate: _startDate,
    endDate: _endDate,
    ...updateModel
  } = previousModel;

  await entity.update({
    id: _id,
    ...updateModel,
    tagIds: _tags.map((x) => x.id),
    completionDate: new Date().toISOString(),
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
    startDate: _startDate,
    endDate: _endDate,
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
