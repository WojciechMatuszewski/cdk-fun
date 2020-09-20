import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";
import * as cognito from "@aws-cdk/aws-cognito";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { CognitoConstruct } from "./cognito";

export class ApiConstruct extends cdk.Construct {
  public readonly lambdaCode: lambda.CfnParametersCode;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, "table", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING }
    });
    table.addGlobalSecondaryIndex({
      indexName: "TypeCreatedAt",
      partitionKey: { name: "type", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING }
    });
    this.lambdaCode = lambda.Code.fromCfnParameters();

    new CognitoConstruct(this, "cognito", {
      table,
      lambdaCode: this.lambdaCode
    });

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
