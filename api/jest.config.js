module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/helpers/",
    "/__tests__/mocks\\.ts$",
  ],
  modulePathIgnorePatterns: [
    "/__tests__/helpers/",
  ],
};
