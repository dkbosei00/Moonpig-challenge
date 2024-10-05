module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    "/node_modules/(?!axios)/", // Allow axios to be transformed
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // If you're using TypeScript
  },
  moduleNameMapper: {
    "^axios$": require.resolve("axios"), // Ensures Jest maps Axios correctly
  },
  testPathIgnorePatterns: [
    "/dist/"  // Ignore the dist folder during testing
  ]
}
