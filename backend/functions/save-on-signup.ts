import { PostConfirmationTriggerHandler } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserModel } from "../lib/models/user";

export function newHandler(db: DocumentClient, tableName: string) {
  const createdHandler: PostConfirmationTriggerHandler = async event => {
    if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword")
      return;

    const userModel = new UserModel(db, tableName);

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

    return event;
  };

  return createdHandler;
}

const handler = newHandler(
  new DocumentClient(),
  process.env.TABLE_NAME as string
);

export { handler };
