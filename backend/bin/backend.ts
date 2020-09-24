#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();

const env = { region: "eu-central-1" };

new PipelineStack(app, "wojtek-tinder-pipeline-dev", {
  env: { region: "eu-central-1" }
});
