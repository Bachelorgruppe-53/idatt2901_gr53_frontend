import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import {
  loadCompetition,
  type CompetitionInfo,
} from "@/services/home/loadCompetition";
import { getLanguageCode } from "@/services/language/languageCode";

jest.mock("@/services/apiConfig", () => ({
  getApiBaseUrl: jest.fn(),
}));

jest.mock("@/services/authService", () => ({
  ensureUserId: jest.fn(),
}));

jest.mock("@/services/language/languageCode", () => ({
  getLanguageCode: jest.fn(),
}));

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;
const mockedEnsureUserId = ensureUserId as jest.MockedFunction<
  typeof ensureUserId
>;
const mockedGetLanguageCode = getLanguageCode as jest.MockedFunction<
  typeof getLanguageCode
>;

describe("loadCompetition", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    mockedEnsureUserId.mockResolvedValue("test-user-id");
    mockedGetLanguageCode.mockReturnValue("en");
    global.fetch = jest.fn();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("successful competition loading", () => {
    it("loads competition successfully with required fields", async () => {
      const competition: CompetitionInfo = {
        id: 1,
        title: "Spring Challenge",
        active: true,
        startTime: "2024-04-01T00:00:00Z",
        endTime: "2024-04-30T23:59:59Z",
        area: "National",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => competition,
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toEqual(competition);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/competition/comp/en",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "X-User-ID": "test-user-id",
            Accept: "application/json",
          }),
        }),
      );
    });

    it("loads competition with all data fields populated", async () => {
      const competition: CompetitionInfo = {
        id: 42,
        title: "Summer Tournament",
        active: false,
        startTime: "2024-06-01T08:00:00Z",
        endTime: "2024-08-31T17:00:00Z",
        area: "Nordic Region",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => competition,
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toEqual(competition);
      expect(result?.id).toBe(42);
      expect(result?.title).toBe("Summer Tournament");
      expect(result?.active).toBe(false);
    });

    it("uses provided language for API call", async () => {
      mockedGetLanguageCode.mockReturnValue("nb");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Test",
          active: true,
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition("nb");

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("/nb");
    });

    it("uses resolved language code in API call", async () => {
      mockedGetLanguageCode.mockReturnValue("en");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Test",
          active: true,
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition("zh-Hans");

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("/en");
    });
  });

  describe("validation and filtering", () => {
    it("returns null for missing required title field", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          active: true,
          // missing title
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for non-string title", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: 123, // not a string
          active: true,
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for missing required startTime field", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Test",
          active: true,
          // missing startTime
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for non-string startTime", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Test",
          active: true,
          startTime: 1234567890, // not a string
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for missing required endTime field", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Test",
          active: true,
          startTime: "2024-01-01T00:00:00Z",
          // missing endTime
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for non-string endTime", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Test",
          active: true,
          startTime: "2024-01-01T00:00:00Z",
          endTime: ["2024-01-31T23:59:59Z"], // array instead of string
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("allows missing optional fields", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          title: "Test",
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
          // id, active, area are optional
        }),
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Test");
    });

    it("returns null for null payload", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => null,
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for non-object payload", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => "not an object",
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null for array payload", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ title: "Test" }],
        text: async () => "",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("returns null when API response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not Found",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null on server error (5xx)", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null on client error (4xx except 404)", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null on JSON parse error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
        text: async () => "Invalid JSON",
      });

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null on fetch exception", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await loadCompetition();

      expect(result).toBeNull();
    });

    it("returns null on timeout", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Request timeout"),
      );

      const result = await loadCompetition();

      expect(result).toBeNull();
    });
  });

  describe("base URL handling", () => {
    it("removes trailing slash from base URL", async () => {
      mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          title: "Test",
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition();

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).not.toContain("//competition");
      expect(callUrl).toContain("http://localhost:8080/competition");
    });

    it("handles base URL without trailing slash", async () => {
      mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          title: "Test",
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition();

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("http://localhost:8080/competition");
    });
  });

  describe("API integration", () => {
    it("passes user ID in correct header format", async () => {
      mockedEnsureUserId.mockResolvedValue("user-123");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          title: "Test",
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition();

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers["X-User-ID"]).toBe("user-123");
    });

    it("uses GET method", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          title: "Test",
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition();

      const method = (global.fetch as jest.Mock).mock.calls[0][1].method;
      expect(method).toBe("GET");
    });

    it("sets Accept header", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          title: "Test",
          startTime: "2024-01-01T00:00:00Z",
          endTime: "2024-01-31T23:59:59Z",
        }),
        text: async () => "",
      });

      await loadCompetition();

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Accept).toBe("application/json");
    });
  });

  describe("multiple calls", () => {
    it("returns fresh data on each call", async () => {
      const competition1: CompetitionInfo = {
        id: 1,
        title: "Competition 1",
        active: true,
        startTime: "2024-01-01T00:00:00Z",
        endTime: "2024-01-31T23:59:59Z",
        area: "Area 1",
      };

      const competition2: CompetitionInfo = {
        id: 2,
        title: "Competition 2",
        active: false,
        startTime: "2024-02-01T00:00:00Z",
        endTime: "2024-02-28T23:59:59Z",
        area: "Area 2",
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => competition1,
          text: async () => "",
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => competition2,
          text: async () => "",
        });

      const result1 = await loadCompetition();
      const result2 = await loadCompetition();

      expect(result1?.id).toBe(1);
      expect(result2?.id).toBe(2);
    });
  });
});
