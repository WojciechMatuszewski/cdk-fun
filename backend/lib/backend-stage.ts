import * as pipelines from "@aws-cdk/pipelines";
import * as cdk from "@aws-cdk/core";
import { BackendStack } from "./backend-stack";

export class BackendStage extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new BackendStack(this, "backendStack");
  }
}
