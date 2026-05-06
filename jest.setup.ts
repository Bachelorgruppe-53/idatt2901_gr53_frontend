jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      hostUri: "127.0.0.1:8081",
    },
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});
