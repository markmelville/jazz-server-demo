import { route } from "./util/index.js";
import { Group, CoMap, co, Account, Profile, Me, CoValue } from "jazz-tools";
import { startWorker } from 'jazz-nodejs';
import { Environment, ListOfEnvironments, Pipeline, StackDirectory } from '../model.js';

const { router, get, put } = route();

class WorkerAccountRoot extends CoMap {
  directory = co.ref(StackDirectory);
  group = co.ref(Group);
}

class WorkerAccount extends Account {
  profile = co.ref(Profile);
  root = co.ref(WorkerAccountRoot);
  migrate = () => {
    if (!this._refs.root) {
      const group = Group.create({ owner: this });
      group.addMember('everyone', 'reader');
      const directory = StackDirectory.create({},{ owner: group });
      this.root = WorkerAccountRoot.create({
        directory, group
      },{ owner: this })
    }
  };
};

let worker: (WorkerAccount&Me)|undefined = undefined;
const connect = async () => {
  const result = await startWorker<WorkerAccount>({
    syncServer: "ws://localhost:4200",
    accountSchema: WorkerAccount
  });
  worker = result.worker;
};
connect().catch(console.log)

const loadRoot = async ()=>{
  if (!worker?._refs?.root) throw "could not connect to sync server";
  const root = await worker._refs.root.load();
  if (!root) throw "could not load account root";
  return root;
}

get("/", async () => {
  const root = await loadRoot();
  const directory = await root._refs.directory.load();
  console.log(directory);
  return directory;
});


get("/:id", async ({params:{id}}) => {
  const root = await loadRoot();
  const directory = await root._refs.directory.load();
  return directory?.[id];
});


put("/:id", async ({params:{id}}) => {
  const root = await loadRoot();
  const directory = await root?._refs.directory.load();
  if (!directory) throw "Stack directory not found";
  const owner = await root?._refs.group.load();
  if (!owner) throw "Object owner group not found";
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

  directory[id] = pipeline;
});


//export const basePath = "/";
export default router;