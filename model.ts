import { CoMap, CoList, co } from "jazz-tools";

export class Pipeline extends CoMap {
  pipelineId = co.string;
  environments = co.ref(ListOfEnvironments);
  executions? = co.ref(MapOfExecutions);
}

export class StackDirectory extends CoMap.Record(co.ref(Pipeline)) {}

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

export class Execution extends CoMap {
  harnessUrl = co.string;
  artifactTag = co.string;
  startTs = co.number;
  endTs = co.number;
}

export class MapOfExecutions extends CoMap.Record(co.ref(Execution)) {}
  