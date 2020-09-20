var __defineProperty = Object.defineProperty;
var __hasOwnProperty = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => {
  return __defineProperty(target, "__esModule", {value: true});
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defineProperty(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2) => {
  __markAsModule(target);
  if (typeof module2 === "object" || typeof module2 === "function") {
    for (let key in module2)
      if (!__hasOwnProperty.call(target, key) && key !== "default")
        __defineProperty(target, key, {get: () => module2[key], enumerable: true});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defineProperty({}, "default", {value: module2, enumerable: true}), module2);
};
__export(exports, {
  PipelineStack: () => PipelineStack
});
const cdk = __toModule(require("@aws-cdk/core"));
const codebuild = __toModule(require("@aws-cdk/aws-codebuild"));
const codepipeline = __toModule(require("@aws-cdk/aws-codepipeline"));
const codepipelineActions = __toModule(require("@aws-cdk/aws-codepipeline-actions"));
class PipelineStack extends cdk.Stack {
  constructor(scope, id, props) {
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
      ]
    });
  }
}
