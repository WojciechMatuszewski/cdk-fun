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

    const buildProject = new codebuild.PipelineProject(this, "build", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: [
              "echo 'it works'",
              "ls -l",
              "cd backend",
              "npm install --silent"
            ]
          },
          build: {
            commands: ["npm run build", "npm run synth", "ls"]
          }
        },
        artifacts: {
          "base-directory": "./backend/build",
          files: ["wojtek-tinder-backend-dev.template.json", "functions/**/*"]
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
      }
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact("buildOutput");

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
              actionName: "build",
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput]
            })
          ]
        }
        // {
        //   stageName: "Deploy",
        //   actions: [
        //     new codepipelineActions.CloudFormationCreateUpdateStackAction({
        //       actionName: "cfnDeploy",
        //       templatePath: buildOutput.atPath(""),
        //       stackName: "",
        //       adminPermissions: true,
        //       parameterOverrides: {
        //         ...props.lambdaCode.assign(buildOutput.s3Location)
        //       },
        //       extraInputs: [buildOutput]
        //     })
        //   ]
        // }
      ]
    });
  }
}
