import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as pipelines from "@aws-cdk/pipelines";
import { BackendStage } from "./backend-stage";

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new pipelines.CdkPipeline(this, "Pipeline", {
      pipelineName: "MyAppPipeline",

      cloudAssemblyArtifact,
      sourceAction: new codepipelineActions.GitHubSourceAction({
        actionName: "Checkout",
        output: sourceArtifact,
        owner: "WojciechMatuszewski",
        repo: "cdk-fun",
        oauthToken: cdk.SecretValue.secretsManager("WojtekGHKey"),
        trigger: codepipelineActions.GitHubTrigger.WEBHOOK
      }),
      synthAction: new pipelines.SimpleSynthAction({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommands: ["cd backend", "npm install"],
        buildCommands: ["npm run build"],
        synthCommand: "npm run synth"
      })
    });

    pipeline.addApplicationStage(
      new BackendStage(this, "BackendStage", {
        env: { region: "eu-central-1" }
      })
    );

    // const installDependencies = new codebuild.PipelineProject(
    //   this,
    //   "install-deps",
    //   {
    //     buildSpec: codebuild.BuildSpec.fromObject({
    //       version: "0.2",
    //       phases: {
    //         install: {
    //           commands: ["cd backend", "npm install --silent", "cd .."]
    //         }
    //       },
    //       artifacts: {
    //         files: ["**/*"]
    //       }
    //     }),
    //     environment: {
    //       buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
    //     }
    //   }
    // );

    // const buildCDK = new codebuild.PipelineProject(this, "cdk-build", {
    //   buildSpec: codebuild.BuildSpec.fromObject({
    //     version: "0.2",
    //     phases: {
    //       install: {
    //         commands: [
    //           "cd backend",
    //           "ls",
    //           "rm -rf node_modules",
    //           "npm install --silent"
    //         ]
    //       },
    //       build: {
    //         commands: ["npm run build-cdk", "npm run synth"]
    //       }
    //     },
    //     artifacts: {
    //       "base-directory": "./backend/cdk-build",
    //       files: ["wojtek-tinder-backend-dev.template.json"]
    //     }
    //   }),
    //   environment: {
    //     buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
    //   }
    // });

    // const buildFunctions = new codebuild.PipelineProject(this, "lambda-build", {
    //   buildSpec: codebuild.BuildSpec.fromObject({
    //     version: "0.2",
    //     phases: {
    //       build: {
    //         commands: ["cd backend", " npm run build-functions"]
    //       }
    //     },
    //     artifacts: {
    //       "base-directory": "./backend/functions-build",
    //       files: ["**/*"]
    //     }
    //   }),
    //   environment: {
    //     buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
    //   }
    // });

    // const sourceOutput = new codepipeline.Artifact();
    // const installOutput = new codepipeline.Artifact();
    // const cdkBuildOutput = new codepipeline.Artifact("cdkBuildOutput");
    // const functionsBuildOutput = new codepipeline.Artifact(
    //   "functionsBuildOutput"
    // );

    // new codepipeline.Pipeline(this, "pipeline", {
    //   stages: [
    //     {
    //       stageName: "Source",
    //       actions: [
    //       ]
    //     },
    //     {
    //       stageName: "Install",
    //       actions: [
    //         new codepipelineActions.CodeBuildAction({
    //           actionName: "InstallDependencies",
    //           project: installDependencies,
    //           input: sourceOutput,
    //           outputs: [installOutput]
    //         })
    //       ]
    //     },
    //     {
    //       stageName: "Build",
    //       actions: [
    //         new codepipelineActions.CodeBuildAction({
    //           actionName: "BuildCDK",
    //           project: buildCDK,
    //           input: installOutput,
    //           outputs: [cdkBuildOutput],
    //           runOrder: 1
    //         }),
    //         new codepipelineActions.CodeBuildAction({
    //           actionName: "BuildFunctions",
    //           project: buildFunctions,
    //           input: installOutput,
    //           outputs: [functionsBuildOutput],
    //           runOrder: 1
    //         })
    //       ]
    //     },
    //     {
    //       stageName: "Deploy",
    //       actions: [
    //         new codepipelineActions.CloudFormationCreateUpdateStackAction({
    //           actionName: "CFNDeploy",
    //           templatePath: cdkBuildOutput.atPath(
    //             "wojtek-tinder-backend-dev.template.json"
    //           ),
    //           stackName: "LambdaDeploymentStack",
    //           adminPermissions: true,
    //           parameterOverrides: {
    //             ...props.lambdaCode.assign(functionsBuildOutput.s3Location)
    //           },
    //           extraInputs: [functionsBuildOutput]
    //         })
    //       ]
    //     }
    //   ]
    // });
  }
}
