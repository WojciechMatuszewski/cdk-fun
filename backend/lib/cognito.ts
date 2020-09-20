import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

type Props = {
  lambdaCode: lambda.CfnParametersCode;
  table: dynamodb.Table;
};

export class CognitoConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    const cognitoUserPool = new cognito.UserPool(this, "userPool", {
      autoVerify: {
        email: true
      },
      passwordPolicy: {
        minLength: 6,
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true
        }
      },
      signInAliases: {
        email: true
      }
    });

    new cognito.UserPoolClient(this, "userPoolClient", {
      userPool: cognitoUserPool,
      authFlows: {
        userPassword: true,
        refreshToken: true
      },
      generateSecret: false,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO
      ]
    });

    const autoConfirmEmailFunction = new lambda.Function(
      this,
      "autoConfirmEmail",
      {
        code: props.lambdaCode,
        handler: "auto-confirm-email.handler",
        runtime: lambda.Runtime.NODEJS_12_X
      }
    );

    const saveUserOnSignupFunction = new lambda.Function(
      this,
      "saveUserOnSignup",
      {
        code: props.lambdaCode,
        handler: "save-on-signup.handler",
        runtime: lambda.Runtime.NODEJS_12_X
      }
    );

    cognitoUserPool.addTrigger(
      cognito.UserPoolOperation.PRE_SIGN_UP,
      autoConfirmEmailFunction
    );

    cognitoUserPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      saveUserOnSignupFunction
    );

    props.table.grantWriteData(saveUserOnSignupFunction);
  }
}
