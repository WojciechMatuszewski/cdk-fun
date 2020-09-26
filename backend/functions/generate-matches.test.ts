import { newHandler } from "./generate-matches";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserModel } from "../lib/models/user";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { dropTable, setup, TEST_TABLE_NAME } from "test/dynamo";

let db: DocumentClient;
beforeEach(async () => (db = await setup()));
afterEach(async () => await dropTable());

test("matches wip", async () => {
  const handler = newHandler(db, TEST_TABLE_NAME);

  const userModel = new UserModel(db, TEST_TABLE_NAME);

  await userModel.saveUser({
    id: "1",
    email: "first@first.com",
    createdAt: new Date(2010).toISOString()
  });

  await userModel.saveUser({
    id: "2",
    email: "second@second.com",
    createdAt: new Date(2011).toISOString()
  });

  await userModel.saveUser({
    id: "3",
    email: "third@third.com",
    createdAt: new Date(2010).toISOString()
  });

  const result = (await handler({
    queryStringParameters: { userId: "2" }
  } as any)) as APIGatewayProxyStructuredResultV2;

  expect(result.statusCode).toBe(200);

  const matchesResult = await userModel.getMatches("2");
  console.log(matchesResult);
  // console.log(result);
  // expect(JSON.parse(result.body as any)).toEqual([
  //   expect.objectContaining({ id: "1" }),
  //   expect.objectContaining({ id: "3" })
  // ]);
});
