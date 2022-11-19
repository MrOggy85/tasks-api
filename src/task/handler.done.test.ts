import { FakeTime } from "https://deno.land/std@0.164.0/testing/time.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  Stub,
  stub,
} from "https://deno.land/std@0.164.0/testing/mock.ts";
import { describe, it } from "https://deno.land/std@0.164.0/testing/bdd.ts";
import { done } from "./handler.ts";
import entity from "../db/repository/task.ts";
import type { TaskModel } from "../db/models.ts";

const FAKE_DATE = "2022-11-13T13:24:00+09:00";

const mockModel: TaskModel = {
  id: 1,
  title: "title",
  description: "description",
  priority: 0,
  startDate: null,
  endDate: null,
  completionDate: null,
  repeat: "",
  repeatType: "completionDate",
  tags: [],
  createdAt: new Date("2022-11-13T13:24:00+09:00"),
  updatedAt: new Date("2022-11-13T13:24:00+09:00"),
};

let getByIdStub: Stub | undefined;
let updateStub: Stub | undefined;
let createStub: Stub | undefined;
let time: FakeTime | undefined;

function restoreStub(s: Stub | undefined) {
  if (s && !s.restored) s.restore();
}

type Stubs = "getById" | "update" | "create";

function doStub(
  s: Stubs,
  f: () => Promise<void> | Promise<TaskModel | undefined>,
) {
  const stubbed = stub(entity, s, f);
  if (s === "getById") {
    getByIdStub = stubbed;
  }
  if (s === "update") {
    updateStub = stubbed;
  }
  if (s === "create") {
    createStub = stubbed;
  }
}

describe("Given 'done' is called", {
  beforeEach: () => {
    time = new FakeTime(FAKE_DATE);
  },
  afterEach: () => {
    restoreStub(getByIdStub);
    restoreStub(updateStub);
    restoreStub(createStub);
    time?.restore();
  },
}, () => {
  it("it calls 'update' with current date as 'completionDate'", async () => {
    doStub("getById", () => {
      return Promise.resolve(mockModel);
    });
    doStub("update", () => {
      return Promise.resolve();
    });

    await done(1);

    const {
      tags: _tags,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      endDate: _endDate,
      startDate: _startDate,
      ...expectedModel
    } = mockModel;

    assertSpyCall(updateStub!, 0, {
      args: [{
        ...expectedModel,
        tagIds: [],
        completionDate: new Date(FAKE_DATE).toISOString(),
      }],
    });
  });

  it("When no repeat, 'create' is not called", async () => {
    doStub("getById", () => {
      return Promise.resolve({
        ...mockModel,
      });
    });
    doStub("update", () => {
      return Promise.resolve();
    });
    doStub("create", () => {
      return Promise.resolve();
    });

    await done(1);

    assertSpyCalls(createStub!, 0);
  });

  const testCases = [
    // Yearly Birthdate
    {
      repeat: "30 6 29 5 *",
      startDate: "2022-05-21T06:30:00.000+09:00",
      endDate: "2022-05-29T06:30:00.000+09:00",
      expectedEndDate: "2023-05-29T06:30:00.000+09:00",
      expectedStartDate: "2023-05-21T06:30:00.000+09:00",
      repeatType: "endDate" as const,
    },
    // Chore every 14 day after completion
    // endDate overdue
    {
      repeat: "D14",
      endDate: "2022-11-12T06:30:00+09:00",
      expectedEndDate: "2022-11-27T06:30:00.000+09:00",
      repeatType: "completionDate" as const,
    },
    // Chore every 10 day after completion
    // endDate in future
    {
      repeat: "D10",
      startDate: "2022-11-23T10:30:00.000+09:00",
      endDate: "2022-11-24T06:30:00+09:00",
      expectedEndDate: "2022-11-24T06:30:00.000+09:00",
      expectedStartDate: "2022-11-23T10:30:00.000+09:00",
      repeatType: "completionDate" as const,
    },
    // Chore every day after completion
    {
      repeat: "D1",
      startDate: "2022-11-12T06:30:00.000+09:00",
      endDate: "2022-11-12T06:30:00+09:00",
      expectedEndDate: "2022-11-14T06:30:00.000+09:00",
      expectedStartDate: "2022-11-14T06:30:00.000+09:00",
      repeatType: "completionDate" as const,
    },
  ];

  testCases.forEach((x) => {
    it(`When repeat: ${x.repeat}, 'create' is called with expected new Task`, async () => {
      doStub("getById", () => {
        return Promise.resolve({
          ...mockModel,
          repeat: x.repeat,
          repeatType: x.repeatType,
          endDate: new Date(x.endDate),
          startDate: x.startDate ? new Date(x.startDate) : null,
        });
      });
      doStub("update", () => {
        return Promise.resolve();
      });
      doStub("create", () => {
        return Promise.resolve();
      });

      await done(1);

      const {
        id: _id,
        tags: _tags,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        completionDate: _completionDate,
        ...expectedModel
      } = mockModel;

      assertSpyCall(createStub!, 0, {
        args: [{
          ...expectedModel,
          tagIds: [],
          repeat: x.repeat,
          repeatType: x.repeatType,
          // completionDate: null,
          endDate: new Date(x.expectedEndDate).toISOString(),
          startDate: x.expectedStartDate
            ? new Date(x.expectedStartDate).toISOString()
            : undefined,
        }],
      });
    });
  });
});
