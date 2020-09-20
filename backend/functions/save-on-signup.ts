import { PostConfirmationTriggerHandler } from "aws-lambda";

const handler: PostConfirmationTriggerHandler = event => {
  if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") return;

  console.log(JSON.stringify(event, null, 2));
};

export { handler };
