import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserModel } from "../lib/models/user";

function newHandler(db: DocumentClient, tableName: string) {
  const createdHandler: APIGatewayProxyHandlerV2 = async ({
    queryStringParameters
  }) => {
    if (!queryStringParameters)
      return { statusCode: 200, body: "NO query params" };

    const userId = queryStringParameters.userId;

    const userModel = new UserModel(db, process.env.TABLE_NAME as string);
    const matchesForUser = await userModel.usersForMatches(userId);

    return {
      statusCode: 200,
      body: JSON.stringify(matchesForUser)
    };
  };

  return createdHandler;
}

const handler = newHandler(
  new DocumentClient(),
  process.env.TABLE_NAME as string
);

export { handler };
