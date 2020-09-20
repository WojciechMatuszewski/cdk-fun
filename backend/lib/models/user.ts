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

  public async usersForMatches(userId: string) {
    const userItem = await this.getUserItem(userId);
    if (!userItem) {
      throw new Error("user not found");
    }

    const { createdAt, pk, alreadyMatched } = userItem;

    const { Items = [] } = await this.db
      .query({
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ":userId": pk,
          ":alreadyMatched": alreadyMatched,
          ":createdAt": createdAt,
          ":type": "USER"
        },
        FilterExpression: `NOT (:userId IN (:alreadyMatched))`,
        IndexName: "TypeCreatedAt",
        KeyConditionExpression: `type = :user and createdAt < :createdAt`
      })
      .promise();

    return (Items as UserItem[]).map(this.fromUserItem);
  }

  public async getUser(userId: string) {
    const userItem = await this.getUserItem(userId);
    if (!userItem) return null;

    return this.fromUserItem(userItem);
  }

  private async getUserItem(userId: string) {
    const key = this.toKey(userId);

    const { Item } = await this.db
      .get({
        TableName: this.tableName,
        Key: key
      })
      .promise();

    return Item as UserItem;
  }

  private toKey(userId: string): UserKey {
    return {
      pk: `USER#${userId}`,
      sk: `USER#${userId}`
    };
  }

  private fromKey(key: UserKey) {
    return key.pk.replace("USER#", "");
  }

  private toUserItem(user: User): UserItem {
    const { id, ...restOfUser } = user;
    const key = this.toKey(user.id);

    return {
      ...key,
      ...restOfUser,
      matchIndex: null,
      type: "USER",
      alreadyMatched: [key.pk]
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
