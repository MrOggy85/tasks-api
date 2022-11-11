import { assertEquals } from "https://deno.land/std@0.162.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
  resolvesNext,
  stub,
} from "https://deno.land/std@0.162.0/testing/mock.ts";
import { done } from './handler.ts';
import entity from "../db/repository/task.ts";
import { TaskModel } from "../db/models.ts";
// import * as entity from "../db/repository/task.ts";

let mockModel: TaskModel = {
  id: 1,
  title: 'title',
  description: 'description',
  priority: 0,
  startDate: null,
  endDate: null,
  completionDate: null,
  repeat: '',
  repeatType: 'completionDate',
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

// stub(entity, 'getById', async () => {
//   console.log('getById');
//   return mockModel
// })
// const hej = stub(entity, 'update', async () => {
//   console.log('update');
//   // return mockModel
// })

Deno.test("url test 2", async () => {

  stub(entity, 'getById', async () => {
    console.log('getById');
    return mockModel
  })
  const updateSpy = stub(entity, 'update', async () => {
    console.log('update');
    // return mockModel
  })



  // const query = stub(entity, "getById", resolvesNext('hej' as any));

  await done(1)

  assertSpyCall(updateSpy, 0, {
    args: [{
      ...mockModel,
    }]
  })
});
