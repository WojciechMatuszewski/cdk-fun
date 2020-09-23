import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dropTable, setup, TEST_TABLE_NAME } from "test/dynamo";
import { User, UserModel } from "../../lib/models/user";
import { newHandler } from "./save-on-signup";

let db: DocumentClient;

beforeEach(async () => (db = await setup()));
afterEach(async () => await dropTable());

test("does not save the user, when the event is of forgot password type", async () => {
  const user: User = {
    id: "1",
    createdAt: new Date().toISOString(),
    email: "test@test.pl"
  };
  const userModel = new UserModel(db, TEST_TABLE_NAME);

  const handler = newHandler(db, TEST_TABLE_NAME);

  await handler({
    triggerSource: "PostConfirmation_ConfirmForgotPassword",
    request: {
      userAttributes: {
        sub: user.id,
        email: user.email
      }
    }
  } as any);

  const userInDB = await userModel.getUser(user.id);
  expect(userInDB).toBe(null);
});

test("it saves the user when new users signs up", async () => {
  const userModel = new UserModel(db, TEST_TABLE_NAME);

  const handler = newHandler(db, TEST_TABLE_NAME);
  await handler({
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: "2",
        email: "test@test.pl"
      }
    }
  } as any);

  const userInDB = await userModel.getUser("2");
  expect(userInDB).toEqual({
    createdAt: expect.any(String),
    email: "test@test.pl",
    id: "2"
  });
});
