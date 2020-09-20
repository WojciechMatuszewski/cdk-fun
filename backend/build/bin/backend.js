#!/usr/bin/env node
var __defineProperty = Object.defineProperty;
var __hasOwnProperty = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => {
  return __defineProperty(target, "__esModule", {value: true});
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
const register = __toModule(require("source-map-support/register"));
const cdk = __toModule(require("@aws-cdk/core"));
const backend_stack = __toModule(require("../lib/backend-stack"));
const pipeline_stack = __toModule(require("../lib/pipeline-stack"));
const app = new cdk.App();
const env = {region: "eu-central-1"};
const backendStack = new backend_stack.BackendStack(app, "wojtek-tinder-backend-dev", {
  env
});
new pipeline_stack.PipelineStack(app, "wojtek-tinder-pipeline-dev", {
  env,
  lambdaCode: backendStack.lambdaCode
});
