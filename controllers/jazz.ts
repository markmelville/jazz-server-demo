import { route } from "./util/index.js";
import { Group, CoMap, co, Account, Profile } from "jazz-tools";
import { createOrResumeWorker } from 'jazz-nodejs';
import { Environment, ListOfEnvironments, Pipeline } from '../model.js';

const { router, get, put } = route();

class StackDirectory extends CoMap.Record(co.ref(Pipeline)) {}

class WorkerAccountRoot extends Account<WorkerAccountRoot> {
  profile = co.ref(Profile);
  root = co.ref(StackDirectory);
  migrate = () => {
    if (!this._refs.root) {
      const group = new Group({ owner: this });
      group.addMember('everyone', 'reader');
      this.root = new StackDirectory({},{ owner: group });
    }
  };
};

const { worker } = await createOrResumeWorker<WorkerAccountRoot>({
  workerName: 'FirstExperiment',
  syncServer: "ws://localhost:4200",
  accountSchema: WorkerAccountRoot
});

get("/", async () => {
  const stacks = await worker._refs.root?.load();
  console.log(stacks);
  return stacks;
});


get("/:id", async ({params:{id}}) => {
  const stacks = await worker._refs.root?.load();
  return stacks?.[id];
});


put("/:id", async ({params:{id}}) => {
  const stacks = await worker._refs.root?.load();
  if (!stacks) {
    return { error: "Stack directory not found" };
  }
  var owner = worker;
  var pipeline = new Pipeline({
    pipelineId: "test",
    environments: new ListOfEnvironments([
      new Environment({
        name: "L3",
        status: "RUNNING",
        executionId: "execId",
      },{ owner })
    ],{ owner }),
  }, { owner });

  stacks[id] = pipeline;
});


//export const basePath = "/";
export default router;