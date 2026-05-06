import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { loadHomeSummary } from "@/services/home/loadHomeSummary";

jest.mock("@/services/apiConfig", () => ({
  getApiBaseUrl: jest.fn(),
}));

jest.mock("@/services/authService", () => ({
  ensureUserId: jest.fn(),
  registerDevice: jest.fn(),
}));

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;
const mockedEnsureUserId = ensureUserId as jest.MockedFunction<
  typeof ensureUserId
>;
const mockedRegisterDevice = registerDevice as jest.MockedFunction<
  typeof registerDevice
>;

type FetchResponseShape = {
  ok: boolean;
  status: number;
  text?: () => Promise<string>;
  json?: () => Promise<unknown>;
};

describe("loadHomeSummary", () => {
  const fetchMock = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    mockedEnsureUserId.mockResolvedValue(
      "123e4567-e89b-12d3-a456-426614174000",
    );
    mockedRegisterDevice.mockResolvedValue(
      "123e4567-e89b-12d3-a456-426614174001",
    );
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("loads summary and class points successfully", async () => {
    const summaryPayload = {
      nickname: "Anna",
      points: 42,
      className: "A",
      schoolName: "B",
      classCode: "XYZ123",
    };

    const responses: FetchResponseShape[] = [
      {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(summaryPayload),
      },
      {
        ok: true,
        status: 200,
        json: async () => ({ points: 100 }),
      },
    ];

    fetchMock.mockImplementation(async () => responses.shift());

    await expect(loadHomeSummary()).resolves.toEqual({
      summary: summaryPayload,
      points: 42,
      classPoints: 100,
      nickname: "Anna",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/user/summary",
      {
        headers: { "X-User-ID": "123e4567-e89b-12d3-a456-426614174000" },
      },
    );
  });

  it("re-registers user and retries summary when UUID is invalid", async () => {
    const summaryPayload = {
      nickname: "Rita",
      points: 10,
      className: "C",
      schoolName: "D",
      classCode: "ABC123",
    };

    const responses: FetchResponseShape[] = [
      {
        ok: false,
        status: 400,
        text: async () => "Invalid UUID format",
      },
      {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(summaryPayload),
      },
      {
        ok: true,
        status: 200,
        json: async () => ({ points: 77 }),
      },
    ];

    fetchMock.mockImplementation(async () => responses.shift());

    const result = await loadHomeSummary();

    expect(mockedRegisterDevice).toHaveBeenCalledTimes(1);
    expect(result.points).toBe(10);
    expect(result.classPoints).toBe(77);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns no-class fallback when backend says user is not related to a class", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "This user is not related to a class",
    });

    await expect(loadHomeSummary()).resolves.toEqual({
      summary: null,
      points: 0,
      classPoints: null,
      nickname: "",
    });
  });

  it("throws on malformed summary JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "not-json",
    });

    await expect(loadHomeSummary()).rejects.toThrow(
      "Invalid server response format",
    );
  });

  it("returns no-class fallback when response starts with 'This user'", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "This user has no class assignment",
    });

    await expect(loadHomeSummary()).resolves.toEqual({
      summary: null,
      points: 0,
      classPoints: null,
      nickname: "",
    });
  });

  it("throws parsed backend message from JSON error payload", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ message: "Forbidden" }),
    });

    await expect(loadHomeSummary()).rejects.toThrow("Forbidden");
  });

  it("throws parsed backend error field when message is missing", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: "Server exploded" }),
    });

    await expect(loadHomeSummary()).rejects.toThrow("Server exploded");
  });

  it("throws raw backend body when error payload is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "plain backend error",
    });

    await expect(loadHomeSummary()).rejects.toThrow("plain backend error");
  });

  it("falls back to zero points and empty nickname when summary fields are missing", async () => {
    const summaryPayload = {
      className: "A",
      schoolName: "B",
      classCode: "XYZ123",
    };

    const responses: FetchResponseShape[] = [
      {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(summaryPayload),
      },
      {
        ok: true,
        status: 200,
        json: async () => ({ points: 10 }),
      },
    ];

    fetchMock.mockImplementation(async () => responses.shift());

    await expect(loadHomeSummary()).resolves.toEqual({
      summary: summaryPayload,
      points: 0,
      classPoints: 10,
      nickname: "",
    });
  });

  it("keeps classPoints as null when class info call is not ok", async () => {
    const summaryPayload = {
      nickname: "Anna",
      points: 42,
      className: "A",
      schoolName: "B",
      classCode: "XYZ123",
    };

    const responses: FetchResponseShape[] = [
      {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(summaryPayload),
      },
      {
        ok: false,
        status: 404,
        json: async () => ({}),
      },
    ];

    fetchMock.mockImplementation(async () => responses.shift());

    const result = await loadHomeSummary();

    expect(result.classPoints).toBeNull();
    expect(result.points).toBe(42);
  });

  it("keeps classPoints as null when class info request throws", async () => {
    const summaryPayload = {
      nickname: "Anna",
      points: 42,
      className: "A",
      schoolName: "B",
      classCode: "XYZ123",
    };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(summaryPayload),
      })
      .mockRejectedValueOnce(new Error("class info failed"));

    const result = await loadHomeSummary();

    expect(result.classPoints).toBeNull();
    expect(result.nickname).toBe("Anna");
  });
});
