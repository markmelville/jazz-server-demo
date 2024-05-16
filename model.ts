import { CoMap, CoList, co } from "jazz-tools";

export class Pipeline extends CoMap {
  pipelineId = co.string;
  environments = co.ref(ListOfEnvironments);
  //executions? = co.ref(MapOfExecutions);
}

export class Environment extends CoMap {
  name = co.string;
  status = co.string;
  executionId = co.string;
  approval? = co.ref(Approval);
}

export class ListOfEnvironments extends CoList.Of(co.ref(Environment)) {}

export class Approval extends CoMap {
  status = co.string;
  executionId = co.string;
}
/*
export class MapOfExecutions extends CoMap<{
  [key: string]: Execution['id'];
}> {}

export class Execution extends CoMap<Execution> {
  harnessUrl = co.string;
  artifactTag = co.string;
  startTs = co.number;
  endTs = co.number;
}
*/
  