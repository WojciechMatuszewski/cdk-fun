import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2
} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserModel } from "../lib/models/user";

function newHandler(db: DocumentClient, tableName: string) {
  const createdHandler = async ({
    queryStringParameters
  }: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    if (!queryStringParameters)
      return { statusCode: 200, body: "NO query params" };

    const userId = queryStringParameters.userId;

    const userModel = new UserModel(db, tableName as string);
    await userModel.generateMatches(userId);

    return {
      statusCode: 200,
      body: JSON.stringify("works")
    };
  };

  return createdHandler;
}

const handler = newHandler(
  new DocumentClient(),
  process.env.TABLE_NAME as string
);

export { handler, newHandler };
