import { newHandler } from "./generate-matches";
import { setup, dropTable } from "../test/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UserModel } from "../lib/models/user";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

beforeEach(async () => await setup());
afterEach(async () => await dropTable());

test("it works", async () => {
  const db = new DocumentClient({
    endpoint: "http://localhost:8000",
    region: "local"
  });

  const handler = newHandler(db, "TestTable");

  const userModel = new UserModel(db, "TestTable");

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

  const result = (await handler(
    { queryStringParameters: { userId: "2" } } as any,
    {} as any,
    () => {}
  )) as APIGatewayProxyStructuredResultV2;

  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body as any)).toEqual([
    expect.objectContaining({ id: "1" })
  ]);
});
