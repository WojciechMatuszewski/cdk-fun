import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dropTable, setup, TEST_TABLE_NAME } from "test/dynamo";
import { User, UserModel } from "./user";

let db: DocumentClient;
beforeAll(async () => (db = await setup()));
afterEach(async () => await dropTable());

test("save <=> get", async () => {
  const userModel = new UserModel(db, TEST_TABLE_NAME);

  const user: User = {
    id: "1",
    createdAt: new Date().toISOString(),
    email: "test@test.pl"
  };
  await userModel.saveUser(user);

  const userInDB = await userModel.getUser(user.id);

  expect(userInDB).toEqual(user);
});
