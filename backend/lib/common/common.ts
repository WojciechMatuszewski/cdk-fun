import { path } from "app-root-path";
import { join } from "path";

export function getLambdaDir() {
  return join(path, "./functions-build");
}
