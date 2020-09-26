import { DocumentClient } from "aws-sdk/clients/dynamodb";
import type { DynamoDB } from "aws-sdk";

interface UserKey {
  pk: string;
  sk: string;
}

interface UserItem extends UserKey {
  email: string;
  type: string;
  createdAt: string;
  matchIndex: DynamoDB.DocumentClient.Key | string;
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

  public async getMatchedUsers(userId: string) {
    const userItem = await this.getUserItem(userId);

    if (!userItem) {
      throw new Error("user not found");
    }

    const { createdAt, pk, sk, matchIndex } = userItem;
    const paginationPayload = this.shouldIncludePaginationInfo(matchIndex)
      ? { ExclusiveStartKey: matchIndex }
      : {};

    const { Items: userItems = [], LastEvaluatedKey, $response } = await this.db
      .query({
        TableName: this.tableName,
        ExpressionAttributeNames: {
          "#type": "type"
        },
        ExpressionAttributeValues: {
          ":userId": pk,
          ":createdAt": createdAt,
          ":type": "USER"
        },
        FilterExpression: `not (pk = :userId)`,
        IndexName: "TypeCreatedAt",
        KeyConditionExpression: `#type = :type and createdAt < :createdAt`,
        ...paginationPayload,
        Limit: 5
      })
      .promise();

    const matches = (userItems as UserItem[]).map(this.fromUserItem.bind(this));

    if (!LastEvaluatedKey) return matches;

    await this.db
      .update({
        Key: { pk, sk },
        TableName: this.tableName,
        UpdateExpression: "SET matchIndex = :matchIndex",
        ExpressionAttributeValues: {
          ":matchIndex": LastEvaluatedKey
        }
      })
      .promise();

    return matches;
  }

  public async generateMatches(userId: string) {
    const matchedUsers = await this.getMatchedUsers(userId);
    if (matchedUsers.length == 0) return;

    const matchesForUser: DynamoDB.DocumentClient.WriteRequest[] = matchedUsers.map(
      matchedUser => {
        return {
          PutRequest: {
            Item: {
              pk: `USER#${userId}`,
              sk: `MATCH#${matchedUser.id}`,
              type: "MATCH"
            }
          }
        };
      }
    );

    const matchesForMatches: DynamoDB.DocumentClient.WriteRequest[] = matchedUsers.map(
      matchedUser => {
        return {
          PutRequest: {
            Item: {
              pk: `USER#${matchedUser.id}`,
              sk: `MATCH#${userId}`,
              type: "MATCH"
            }
          }
        };
      }
    );

    await this.db
      .batchWrite({
        RequestItems: {
          [this.tableName]: [...matchesForUser, ...matchesForMatches]
        }
      })
      .promise();
  }

  public async getMatches(userId: string) {
    const result = await this.db
      .query({
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ":userId": `USER#${userId}`,
          ":sk": `MATCH`
        },
        KeyConditionExpression: `pk = :userId AND begins_with(sk, :sk)`
      })
      .promise();

    return result.Items;
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
      matchIndex: "INITIAL",
      type: "USER"
    };
  }

  private fromUserItem(userItem: UserItem): User {
    return {
      id: this.fromKey({ pk: userItem.pk, sk: userItem.sk }),
      email: userItem.email,
      createdAt: userItem.createdAt
    };
  }

  private shouldIncludePaginationInfo(
    currentMatchIndex: UserItem["matchIndex"]
  ): currentMatchIndex is DynamoDB.DocumentClient.Key {
    return currentMatchIndex != "INITIAL";
  }
}

export { UserModel, User };
