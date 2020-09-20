const { build } = require("esbuild");
const fg = require("fast-glob");

const whatToBuild = process.argv[2];

async function buildCDK() {
  const entryPoints = await fg([
    "./**/*.ts",
    "!./functions/**/*.ts",
    "!node_modules"
  ]);

  await build({
    entryPoints,
    minify: false,
    bundle: false,
    outdir: "cdk-build",
    tsconfig: "./tsconfig.json",
    format: "cjs"
  });
}

async function buildFunctions() {
  const entryPoints = await fg(["./functions/**/*.ts", "!node_modules"]);

  await build({
    entryPoints,
    minify: true,
    bundle: true,
    outdir: "functions-build",
    platform: "node",
    target: "node12",
    format: "cjs",
    tsconfig: "./tsconfig.json"
  });
}

(() => {
  if (whatToBuild === "cdk") return buildCDK();

  if (whatToBuild === "functions") return buildFunctions();

  throw new Error(`unknown target ${whatToBuild}`);
})();
