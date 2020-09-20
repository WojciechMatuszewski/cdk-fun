import { DocumentClient } from "aws-sdk/clients/dynamodb";

interface UserKey {
  pk: string;
  sk: string;
}

interface UserItem extends UserKey {
  email: string;
  type: string;
  createdAt: string;
  matchIndex: string | null;
  alreadyMatched: string[];
}

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

  public async getUser(id: string) {
    const key = this.toKey(id);

    const result = await this.db
      .get({
        TableName: this.tableName,
        Key: key
      })
      .promise();

    if (!result.Item) return null;

    return this.fromUserItem(result.Item as UserItem);
  }

  private toKey(id: string): UserKey {
    return {
      pk: `USER#${id}`,
      sk: `USER#${id}`
    };
  }

  private fromKey(key: UserKey) {
    return key.pk.replace("USER#", "");
  }

  private toUserItem(user: User): UserItem {
    const { id, ...restOfUser } = user;
    return {
      ...this.toKey(user.id),
      ...restOfUser,
      matchIndex: null,
      type: "USER",
      alreadyMatched: [user.id]
    };
  }

  private fromUserItem(userItem: UserItem): User {
    return {
      id: this.fromKey({ pk: userItem.pk, sk: userItem.sk }),
      email: userItem.email,
      createdAt: userItem.createdAt
    };
  }
}

export { UserModel, User };
