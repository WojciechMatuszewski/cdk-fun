import { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

const port = "8000";
const endpoint = `http://localhost:${port}`;

export const TEST_TABLE_NAME = "TestTable";

async function createTable(db: DynamoDB) {
  await db
    .createTable({
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "type", AttributeType: "S" },
        { AttributeName: "createdAt", AttributeType: "S" }
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "SORT" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "TypeCreatedAt",
          KeySchema: [
            { AttributeName: "type", KeyType: "HASH" },
            { AttributeName: "createdAt", KeyType: "SORT" }
          ],
          Projection: { ProjectionType: "ALL" }
        }
      ],
      TableName: TEST_TABLE_NAME,
      BillingMode: "PAY_PER_REQUEST"
    })
    .promise();
}

async function setup() {
  await spinContainer();

  const dynamodb = new DynamoDB({
    region: "local",
    endpoint: endpoint
  });

  await createTable(dynamodb);

  return new DocumentClient({
    region: "local",
    endpoint: endpoint
  });
}

async function dropTable() {
  const dynamodb = new DynamoDB({
    region: "local",
    endpoint: endpoint
  });

  await dynamodb.deleteTable({ TableName: "TestTable" }).promise();
}

async function spinContainer() {
  const isRunningCMD = `docker ps -q -f name=cdk-twitter-dynamo`;
  const spinContainerCMD = `docker run -d -p ${port}:${port} --name cdk-twitter-dynamo amazon/dynamodb-local`;

  try {
    const { stdout } = await execPromise(isRunningCMD);
    if (stdout === "") {
      await execPromise(spinContainerCMD);
    }
  } catch (e) {
    throw new Error(`Could not spin the dynamo container: ${e.message}`);
  }
}

export { setup, dropTable, spinContainer };
