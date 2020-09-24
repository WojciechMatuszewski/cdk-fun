import * as cdk from "@aws-cdk/core";

import { ApiConstruct } from "./api";

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ApiConstruct(this, "Api");
  }
}
