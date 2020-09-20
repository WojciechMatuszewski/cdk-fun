import { PreSignUpTriggerHandler } from "aws-lambda";

const handler: PreSignUpTriggerHandler = (event, ctx, callback) => {
  event.response.autoConfirmUser = true;
  console.log("about to return", JSON.stringify(event, null, 2));

  return callback(null, event);
};

export { handler };
