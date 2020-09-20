import { PostConfirmationTriggerHandler } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserModel } from "../lib/models/user";

const db = new DocumentClient();

const handler: PostConfirmationTriggerHandler = async event => {
  if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") return;

  const userModel = new UserModel(db, process.env.TABLE_NAME as string);

  const {
    request: {
      userAttributes: { sub: id, email }
    }
  } = event;

  await userModel.saveUser({
    id,
    email,
    createdAt: new Date().toISOString()
  });
};

export { handler };
