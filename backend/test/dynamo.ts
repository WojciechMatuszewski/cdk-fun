import { DynamoDB } from "aws-sdk";

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
      TableName: "TestTable",
      BillingMode: "PAY_PER_REQUEST"
    })
    .promise();
}

async function setup() {
  const dynamodb = new DynamoDB({
    region: "local",
    endpoint: "http://localhost:8000"
  });

  await createTable(dynamodb);
}

async function dropTable() {
  const dynamodb = new DynamoDB({
    region: "local",
    endpoint: "http://localhost:8000"
  });

  await dynamodb.deleteTable({ TableName: "TestTable" }).promise();
}

export { setup, dropTable };

// setup();
// dropTable();
