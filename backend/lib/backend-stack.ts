import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

import { ApiConstruct } from "./api";

export class BackendStack extends cdk.Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new ApiConstruct(this, "Api");
    this.lambdaCode = api.lambdaCode;
  }
}
