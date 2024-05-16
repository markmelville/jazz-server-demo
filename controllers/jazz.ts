import { route } from "./util/index.js";
import { Group, CoMap, co, Account, Profile, Me } from "jazz-tools";
import { startWorker } from 'jazz-nodejs';
import { Environment, ListOfEnvironments, Pipeline } from '../model.js';

const { router, get, put } = route();

class StackDirectory extends CoMap.Record(co.ref(Pipeline)) {}

class WorkerAccountRoot extends Account {
  profile = co.ref(Profile);
  root = co.ref(StackDirectory);
  migrate = () => {
    if (!this._refs.root) {
      const group = Group.create({ owner: this });
      group.addMember('everyone', 'reader');
      this.root = StackDirectory.create({},{ owner: group });
    }
  };
};

let worker: (WorkerAccountRoot&Me)|undefined = undefined;
const connect = async () => {
  const result = await startWorker<WorkerAccountRoot>({
    syncServer: "ws://localhost:4200",
    accountSchema: WorkerAccountRoot
  });
  worker = result.worker;
};
connect().catch(console.log)

const loadRoot = async ()=>worker?._refs?.root?.load()

get("/", async () => {
  const stacks = await loadRoot();
  console.log(stacks);
  return stacks;
});


get("/:id", async ({params:{id}}) => {
  const stacks = await loadRoot();
  return stacks?.[id];
});


put("/:id", async ({params:{id}}) => {
  const stacks = await loadRoot();
  if (!stacks) return { error: "Stack directory not found" };
  if (!worker) return { error: "Worker directory not found" };
  var owner = worker;
  var pipeline = Pipeline.create({
    pipelineId: "test",
    environments: ListOfEnvironments.create([
      Environment.create({
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