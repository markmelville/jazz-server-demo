import { route } from "./util";
import {
  CoID,
  CoValue,
  CoMap,
  Profile
} from 'cojson';
import { createOrResumeWorker } from 'jazz-nodejs';
import { Environment, ListOfEnvironments, Pipeline } from '../model';

const { router, get, put } = route();

type StackDirectory = CoMap<{
  [key: string]: Pipeline['id'];
}>;
type WorkerAccountRoot = CoMap<{
  directory: StackDirectory["id"];
}>;
const { localNode: node, worker } = await createOrResumeWorker<Profile,WorkerAccountRoot>({
  workerName: 'FirstExperiment',
  syncServer: "ws://localhost:4200",
  migration: async (account, profile) => {
    console.log("account", new Date(), account.toJSON());
    if (!account.get('root')) {
      const group = account.createGroup();
      group.addMember('everyone', 'reader');
      const directory = group.createMap<StackDirectory>({});

      console.log(
        'initializing root',
        new Date(),
      );

      const after = account.set(
        'root',
        account.createMap<WorkerAccountRoot>({
          directory: directory.id
        }).id
      );

      console.log(new Date(), directory.id, after.toJSON());
    }
  },
}); //co_zTkmq9s27mxqrKbSEKU8sgSqczr

async function getDirectory() {
  const root = await load(worker.get("root"));
  return await load(root.get("directory"));
}

async function load<T extends CoValue>(id: CoID<T>):Promise<T> {
  const result = await node.load(id);
  if (result === "unavailable") throw "oops";
  return result;
}

get("/", async () => {
  const directory = await getDirectory();
  return directory.keys();
});


get("/:id", async ({params}) => {
  const directory = await getDirectory();
  const stack = await load(directory.get(params.id));
  const environmentsList = await load(stack.get("environments"));
  const envs = environmentsList.asArray().map(async id=> await load(id));
  return {
    ...stack.toJSON(),
    environments: (await Promise.all(envs)).map(e=>e.toJSON())
  }
});

put("/:id", async ({params}) => {
  const directory = await getDirectory();
  const factory = directory.group;
  directory.set(params.id, factory.createMap<Pipeline>({
    pipelineId: "test",
    environments: factory.createList<ListOfEnvironments>([
      factory.createMap<Environment>({
        name: "L3",
        status: "RUNNING",
        executionId: "execId",
      }).id
    ]).id,
  }).id);
});



//export const basePath = "/";
export default router;