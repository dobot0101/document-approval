// /** @type {import('ts-jest').JestConfigWithTsJest} */
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
// };

module.exports = {
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  // "globalSetup": "./src/jest/globalSetup.ts",
  // "globalTeardown": "./src/jest/globalTeardown.ts"
  // "setupFilesAfterEnv": ["./src/jest/setupDB.ts"]
}