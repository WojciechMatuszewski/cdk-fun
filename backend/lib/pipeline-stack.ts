import * as cdk from "@aws-cdk/core";
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
        installCommands: ["npm install"],
        buildCommands: ["npm run build"],
        synthCommand: "npm run synth",
        subdirectory: "backend"
      })
    });

    pipeline.addApplicationStage(
      new BackendStage(this, "BackendStage", {
        env: { region: "eu-central-1" }
      })
    );
  }
}
