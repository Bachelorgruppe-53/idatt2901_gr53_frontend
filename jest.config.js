module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^expo-modules-core/(.*)$": "<rootDir>/__mocks__/expo-modules-core/$1",
    "^expo-modules-core$": "<rootDir>/__mocks__/expo-modules-core/index.js",
    "^@expo/vector-icons$": "<rootDir>/__mocks__/@expo/vector-icons.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/ios/", "/android/"],
};
