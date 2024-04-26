import { CoMap, CoList } from 'cojson';

export type Pipeline = CoMap<{
  pipelineId: string;
  environments: ListOfEnvironments['id'];
  executions?: MapOfExecutions["id"];
}>;

export type ListOfEnvironments = CoList<Environment['id']>;

export type Environment = CoMap<{
  name: string;
  status: string;
  executionId: string;
  approval?: Approval['id'];
}>;

export type Approval = CoMap<{
  status: string;
  executionId: string;
}>;

export type MapOfExecutions = CoMap<{
  [key: string]: Execution['id'];
}>;

export type Execution = CoMap<{
  harnessUrl: string;
  artifactTag: string;
  startTs: number;
  endTs: number;
}>;
  