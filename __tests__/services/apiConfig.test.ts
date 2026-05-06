describe("getApiBaseUrl", () => {
  const runtimeGlobals = globalThis as typeof globalThis & {
    __DEV__: boolean;
  };
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;
  const originalDev = runtimeGlobals.__DEV__;

  afterEach(() => {
    if (typeof originalEnv === "undefined") {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    }
    Object.defineProperty(globalThis, "__DEV__", {
      value: originalDev,
      configurable: true,
    });
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadGetApiBaseUrl = (params: {
    hostUri?: string;
    platformOs?: "ios" | "android" | "web";
    dev?: boolean;
    envUrl?: string;
  }) => {
    const { hostUri, platformOs = "ios", dev = true, envUrl } = params;

    jest.resetModules();
    if (typeof envUrl === "undefined") {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = envUrl;
    }
    Object.defineProperty(globalThis, "__DEV__", {
      value: dev,
      configurable: true,
    });

    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: {
        expoConfig: hostUri ? { hostUri } : undefined,
      },
    }));

    jest.doMock("react-native", () => ({
      Platform: {
        OS: platformOs,
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module =
      require("@/services/apiConfig") as typeof import("@/services/apiConfig");
    return module.getApiBaseUrl;
  };

  it("uses EXPO_PUBLIC_API_URL when set and trims trailing slash", () => {
    const getApiBaseUrl = loadGetApiBaseUrl({
      envUrl: " https://api.example.com/ ",
      dev: true,
      hostUri: "192.168.1.20:8081",
    });

    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("uses Expo hostUri in development", () => {
    const getApiBaseUrl = loadGetApiBaseUrl({
      hostUri: "192.168.1.20:8081",
      dev: true,
      platformOs: "ios",
    });

    expect(getApiBaseUrl()).toBe("http://192.168.1.20:8080");
  });

  it("uses Expo hostUri on Android in development", () => {
    const getApiBaseUrl = loadGetApiBaseUrl({
      hostUri: "192.168.1.20:8081",
      dev: true,
      platformOs: "android",
    });

    expect(getApiBaseUrl()).toBe("http://192.168.1.20:8080");
  });

  it("uses Android emulator fallback in development when hostUri is missing", () => {
    const getApiBaseUrl = loadGetApiBaseUrl({
      hostUri: undefined,
      dev: true,
      platformOs: "android",
    });

    expect(getApiBaseUrl()).toBe("http://10.0.2.2:8080");
  });

  it("uses default backend host in production", () => {
    const getApiBaseUrl = loadGetApiBaseUrl({
      hostUri: "192.168.1.20:8081",
      dev: false,
      platformOs: "ios",
    });

    expect(getApiBaseUrl()).toBe("http://localhost:8080");
  });
});
