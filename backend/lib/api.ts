import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";

export class ApiConstruct extends cdk.Construct {
  public readonly lambdaCode: lambda.CfnParametersCode;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.lambdaCode = lambda.Code.fromCfnParameters();

    const fooHandler = new lambda.Function(this, "fooHandler", {
      code: this.lambdaCode,
      handler: "foo.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });

    const barHandler = new lambda.Function(this, "barHandler", {
      code: this.lambdaCode,
      handler: "bar.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });

    const api = new apigwv2.HttpApi(this, "api", { createDefaultStage: false });
    api.addStage("apiStage", { autoDeploy: true, stageName: "dev" });

    const fooIntegration = new apigwv2.LambdaProxyIntegration({
      handler: fooHandler
    });
    api.addRoutes({
      path: "/foo",
      methods: [apigwv2.HttpMethod.GET],
      integration: fooIntegration
    });

    const barIntegration = new apigwv2.LambdaProxyIntegration({
      handler: barHandler
    });
    api.addRoutes({
      path: "/bar",
      methods: [apigwv2.HttpMethod.GET],
      integration: barIntegration
    });
  }
}
