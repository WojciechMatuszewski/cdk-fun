import { PreSignUpTriggerHandler } from "aws-lambda";

const handler: PreSignUpTriggerHandler = async event => {
  event.response.autoConfirmUser = true;
  console.log("about to return", JSON.stringify(event, null, 2));
  return event;
};

export { handler };
