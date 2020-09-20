var __defineProperty = Object.defineProperty;
var __hasOwnProperty = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => {
  return __defineProperty(target, "__esModule", {value: true});
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defineProperty(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2) => {
  __markAsModule(target);
  if (typeof module2 === "object" || typeof module2 === "function") {
    for (let key in module2)
      if (!__hasOwnProperty.call(target, key) && key !== "default")
        __defineProperty(target, key, {get: () => module2[key], enumerable: true});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defineProperty({}, "default", {value: module2, enumerable: true}), module2);
};
__export(exports, {
  ApiConstruct: () => ApiConstruct
});
const cdk = __toModule(require("@aws-cdk/core"));
const lambda = __toModule(require("@aws-cdk/aws-lambda"));
class ApiConstruct extends cdk.Construct {
  constructor(scope, id) {
    super(scope, id);
    this.lambdaCode = lambda.Code.fromCfnParameters();
    const fooHandler = new lambda.Function(this, "fooHandler", {
      code: this.lambdaCode,
      handler: "foo.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });
    const barHandler = new lambda.Function(this, "barHandler", {
      code: this.lambdaCode,
      handler: "bar.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });
  }
}
