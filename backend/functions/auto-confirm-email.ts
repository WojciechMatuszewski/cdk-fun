import { PreSignUpTriggerHandler } from "aws-lambda";

const handler: PreSignUpTriggerHandler = async event => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};

export { handler };
