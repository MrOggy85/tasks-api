import { create as createTask } from "../task/handler.ts";

async function seedData() {
  await createTask({
    title: "Task1",
  });
  await createTask({
    title: "Task2",
  });
}

export default seedData;
