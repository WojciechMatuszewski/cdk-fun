import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as ssm from "@aws-cdk/aws-ssm";

interface PipelineStackProps extends cdk.StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const buildCDK = new codebuild.PipelineProject(this, "cdk-build", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: ["cd backend", "npm install --silent"]
          },
          build: {
            commands: ["npm run build-cdk", "npm run synth"]
          }
        },
        artifacts: {
          "base-directory": "./backend/cdk-build",
          files: ["wojtek-tinder-backend-dev.template.json"]
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
      }
    });

    const buildFunctions = new codebuild.PipelineProject(this, "lambda-build", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: ["cd backend", "npm install --silent"]
          },
          build: {
            commands: ["npm run build-functions"]
          }
        },
        artifacts: {
          "base-directory": "./backend/functions-build",
          files: ["**/*"]
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
      }
    });

    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact("cdkBuildOutput");
    const functionsBuildOutput = new codepipeline.Artifact(
      "functionsBuildOutput"
    );

    new codepipeline.Pipeline(this, "pipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipelineActions.GitHubSourceAction({
              actionName: "Checkout",
              output: sourceOutput,
              owner: "WojciechMatuszewski",
              repo: "cdk-fun",
              oauthToken: cdk.SecretValue.secretsManager("WojtekGHKey"),
              trigger: codepipelineActions.GitHubTrigger.WEBHOOK
            })
          ]
        },
        {
          stageName: "Build",
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: "BuildCDK",
              project: buildCDK,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
              runOrder: 1
            })
          ]
        },
        {
          stageName: "Build",
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: "BuildFunctions",
              project: buildFunctions,
              input: sourceOutput,
              outputs: [functionsBuildOutput],
              runOrder: 1
            })
          ]
        },
        {
          stageName: "Deploy",
          actions: [
            new codepipelineActions.CloudFormationCreateUpdateStackAction({
              actionName: "CFNDeploy",
              templatePath: cdkBuildOutput.atPath(
                "wojtek-tinder-backend-dev.template.json"
              ),
              stackName: "LambdaDeploymentStack",
              adminPermissions: true,
              parameterOverrides: {
                ...props.lambdaCode.assign(functionsBuildOutput.s3Location)
              },
              extraInputs: [functionsBuildOutput]
            })
          ]
        }
      ]
    });
  }
}
