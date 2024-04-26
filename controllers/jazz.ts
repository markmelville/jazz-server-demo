import { route } from "./util";
import { Group, CoMap, co, Account, Profile } from "jazz-tools";
import { createOrResumeWorker } from 'jazz-nodejs';
import { Environment, ListOfEnvironments, Pipeline } from '../model';

const { router, get, put } = route();

class StackDirectory extends CoMap<StackDirectory> {
  //[key: string] = co.ref(Pipeline);
  test = co.ref(Pipeline);
}
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
});

get("/", async () => {
  return worker.root;
});


get("/:id", async ({params:{id}}) => {
  return worker.root[id];
});


put("/:id", async ({params}) => {
  var pipeline = new Pipeline({
    pipelineId: "test",
    environments: new ListOfEnvironments([
      new Environment({
        name: "L3",
        status: "RUNNING",
        executionId: "execId",
      },{ owner: worker })
    ],{ owner: worker }),
  }, { owner: worker });

  worker.root.test = pipeline;
});


//export const basePath = "/";
export default router;