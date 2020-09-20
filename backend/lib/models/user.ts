import { DocumentClient } from "aws-sdk/clients/dynamodb";

type UserItem = {
  email: string;
  pk: string;
  sk: string;
  type: string;
  createdAt: string;
};

type User = {
  email: string;
  id: string;
  createdAt: string;
};

class UserModel {
  tableName: string;
  db: DocumentClient;

  constructor(db: DocumentClient, tableName: string) {
    this.tableName = tableName;
    this.db = db;
  }

  public async saveUser(user: User) {
    await this.db
      .put({
        TableName: this.tableName,
        Item: this.toUserItem(user),
        ReturnValues: "NONE"
      })
      .promise();
  }

  private toUserItem(user: User) {
    const { id, ...restOfUser } = user;
    return {
      pk: `USER#${id}`,
      sk: `USER#${id}`,
      ...restOfUser
    };
  }
}

export { UserModel, User };
