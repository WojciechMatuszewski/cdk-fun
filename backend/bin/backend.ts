#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BackendStack } from "../lib/backend-stack";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();

const env = { region: "eu-central-1" };

const backendStack = new BackendStack(app, "wojtek-tinder-backend-dev", {
  env
});

new PipelineStack(app, "wojtek-tinder-pipeline-dev", {
  env,
  lambdaCode: backendStack.lambdaCode
});
