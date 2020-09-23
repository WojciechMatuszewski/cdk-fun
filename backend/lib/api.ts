import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { CognitoConstruct } from "./cognito";
import * as s3_assets from "@aws-cdk/aws-s3-assets";
import { join } from "path";

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

    const api = new apigwv2.HttpApi(this, "api", { createDefaultStage: false });
    api.addStage("apiStage", { autoDeploy: true, stageName: "dev" });

    const matchesHandlerAsset = new s3_assets.Asset(this, "matchesHandler", {
      path: join(__dirname, "../../functions-build/generate-matches")
    });

    this.lambdaCode.assign({
      bucketName: matchesHandlerAsset.s3BucketName,
      objectKey: matchesHandlerAsset.s3ObjectKey
    });

    const generateMatchesHandler = new lambda.Function(
      this,
      "generateMatches",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "generate-matches.handler",
        code: lambda.Code.fromBucket(
          matchesHandlerAsset.bucket,
          matchesHandlerAsset.s3ObjectKey
        ),
        environment: {
          TABLE_NAME: table.tableName
        }
      }
    );
    table.grantReadData(generateMatchesHandler);

    const generateMatchesIntegration = new apigwv2.LambdaProxyIntegration({
      handler: generateMatchesHandler
    });

    api.addRoutes({
      path: "/matches",
      methods: [apigwv2.HttpMethod.GET],
      integration: generateMatchesIntegration
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: api.url || "something went wrong :c"
    });
  }
}
