const { join } = require("path");

module.exports = {
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "test/(.*)": "<rootDir>/test/$1"
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
