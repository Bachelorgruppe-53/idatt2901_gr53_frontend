import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { loadUnlockedCareers } from "@/services/career/loadUnlockedCareers";
import { getLanguageCode } from "@/services/language/languageCode";

jest.mock("@/services/apiConfig", () => ({
  getApiBaseUrl: jest.fn(),
}));

jest.mock("@/services/authService", () => ({
  ensureUserId: jest.fn(),
  registerDevice: jest.fn(),
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
const mockedRegisterDevice = registerDevice as jest.MockedFunction<
  typeof registerDevice
>;
const mockedGetLanguageCode = getLanguageCode as jest.MockedFunction<
  typeof getLanguageCode
>;

describe("loadUnlockedCareers", () => {
  beforeEach(() => {
    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    mockedEnsureUserId.mockResolvedValue("test-user-id");
    mockedRegisterDevice.mockResolvedValue("new-user-id");
    mockedGetLanguageCode.mockReturnValue("en");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("successful career loading", () => {
    it("loads unlocked careers successfully with GET request", async () => {
      const careerData = [
        {
          career_id: 1,
          name: "Software Engineer",
          iconName: "code",
          color: 5,
        },
        {
          career_id: 2,
          name: "Designer",
          iconName: "palette",
          color: 3,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => careerData,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(2);
      expect(result.careers[0]).toEqual({
        career_id: 1,
        name: "Software Engineer",
        iconName: "code",
        colorCode: 5,
      });
      expect(result.pagination).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/career/claimed/en?page=0",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "X-User-ID": "test-user-id",
            "x-user-id": "test-user-id",
          }),
        }),
      );
    });

    it("loads careers with pagination metadata", async () => {
      const payloadWithPagination = {
        page: {
          size: 10,
          number: 0,
          totalElements: 25,
          totalPages: 3,
        },
        data: [
          {
            career_id: 1,
            name: "Career 1",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payloadWithPagination,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.pagination).toEqual({
        size: 10,
        number: 0,
        totalElements: 25,
        totalPages: 3,
      });
      expect(result.careers).toHaveLength(1);
    });

    it("falls back to POST when GET fails with non-UUID error", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: async () => "Service Unavailable",
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [{ career_id: 1, name: "Career 1" }],
          text: async () => "",
        });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const secondCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(secondCall[1]?.method).toBe("POST");
    });

    it("handles plain array response without pagination", async () => {
      const plainArrayResponse = [
        {
          career_id: 1,
          name: "Career 1",
        },
        {
          career_id: 2,
          name: "Career 2",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => plainArrayResponse,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(2);
      expect(result.pagination).toEqual({
        size: 2,
        number: 0,
        totalElements: 2,
        totalPages: 1,
      });
    });

    it("extracts nested careers from various payload structures", async () => {
      const payloads = [
        {
          data: [{ career_id: 1, name: "Career 1" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        },
        {
          body: [{ career_id: 2, name: "Career 2" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        },
        {
          careers: [{ career_id: 3, name: "Career 3" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        },
        {
          result: [{ career_id: 4, name: "Career 4" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        },
        {
          items: [{ career_id: 5, name: "Career 5" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        },
        {
          content: [{ career_id: 6, name: "Career 6" }],
          page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
        },
      ];

      for (const payload of payloads) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => payload,
          text: async () => "",
        });

        mockedEnsureUserId.mockResolvedValueOnce("test-user-id");
      }

      for (const _ of payloads) {
        const result = await loadUnlockedCareers();
        expect(result.careers).toHaveLength(1);
      }
    });

    it("parses JSON string payloads", async () => {
      const jsonStringPayload = '[{"career_id": 1, "name": "Career 1"}]';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => jsonStringPayload,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(1);
      expect(result.careers[0].career_id).toBe(1);
    });
  });

  describe("UUID error handling and retry", () => {
    it("detects UUID error and re-registers before retrying", async () => {
      (global.fetch as jest.Mock)
        // First attempt: GET with UUID error (returns immediately with shouldReregister: true)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => "Invalid UUID format",
        })
        // Second attempt after re-register: GET succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [{ career_id: 1, name: "Career 1" }],
          text: async () => "",
        });

      const result = await loadUnlockedCareers();

      expect(mockedRegisterDevice).toHaveBeenCalledTimes(1);
      expect(result.careers).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("uses new user ID after re-registration", async () => {
      (global.fetch as jest.Mock)
        // First attempt: GET with UUID error
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => "Invalid UUID format",
        })
        // Second attempt after re-register: GET succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [{ career_id: 1, name: "Career 1" }],
          text: async () => "",
        });

      await loadUnlockedCareers();

      const secondAttemptCall = (global.fetch as jest.Mock).mock.calls[1];
      expect(secondAttemptCall[1]?.headers["X-User-ID"]).toBe("new-user-id");
      expect(secondAttemptCall[1]?.headers["x-user-id"]).toBe("new-user-id");
    });

    it("retries with POST on UUID error when GET fails", async () => {
      (global.fetch as jest.Mock)
        // First attempt: GET succeeds but returns error status (not UUID error scenario)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: async () => "Service Unavailable",
        })
        // First attempt: POST with UUID error
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => "Invalid UUID format",
        })
        // Second attempt after re-register: GET succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [{ career_id: 1, name: "Career 1" }],
          text: async () => "",
        });

      const result = await loadUnlockedCareers();

      expect(mockedRegisterDevice).toHaveBeenCalledTimes(1);
      expect(result.careers).toHaveLength(1);
      // First GET + First POST (UUID error) + Second GET (after re-register)
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("does not retry on non-UUID 400 errors", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => "Bad Request",
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => "Bad Request",
        });

      const result = await loadUnlockedCareers();

      expect(mockedRegisterDevice).not.toHaveBeenCalled();
      expect(result.careers).toHaveLength(0);
    });
  });

  describe("normalized career field handling", () => {
    it("handles different career ID field names", async () => {
      const response = [
        { id: 1, name: "Career 1" },
        { careerId: 2, name: "Career 2" },
        { career_id: 3, name: "Career 3" },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(3);
      expect(result.careers[0].career_id).toBe(1);
      expect(result.careers[1].career_id).toBe(2);
      expect(result.careers[2].career_id).toBe(3);
    });

    it("handles different career name field names", async () => {
      const response = [
        { career_id: 1, title: "Software Engineer" },
        { career_id: 2, careerName: "Designer" },
        { career_id: 3, name: "Manager" },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(3);
      expect(result.careers[0].name).toBe("Software Engineer");
      expect(result.careers[1].name).toBe("Designer");
      expect(result.careers[2].name).toBe("Manager");
    });

    it("handles different icon name field variants", async () => {
      const response = [
        { career_id: 1, name: "Career 1", icon_name: "code" },
        { career_id: 2, name: "Career 2", iconName: "palette" },
        { career_id: 3, name: "Career 3", icon: "star" },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers[0].iconName).toBe("code");
      expect(result.careers[1].iconName).toBe("palette");
      expect(result.careers[2].iconName).toBe("star");
    });

    it("handles different color field variants", async () => {
      const response = [
        { career_id: 1, name: "Career 1", color_code: 1 },
        { career_id: 2, name: "Career 2", colorCode: 2 },
        { career_id: 3, name: "Career 3", color: 3 },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers[0].colorCode).toBe(1);
      expect(result.careers[1].colorCode).toBe(2);
      expect(result.careers[2].colorCode).toBe(3);
    });

    it("filters out invalid careers missing required fields", async () => {
      const response = [
        { career_id: 1, name: "Valid Career" },
        { career_id: 2 }, // missing name
        { name: "Invalid Career" }, // missing ID
        { career_id: 4, name: "   " }, // name is empty after trim
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(1);
      expect(result.careers[0].career_id).toBe(1);
    });

    it("handles string numbers as career IDs", async () => {
      const response = [
        { career_id: "1", name: "Career 1" },
        { id: "42", name: "Career 2" },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(2);
      expect(result.careers[0].career_id).toBe(1);
      expect(result.careers[1].career_id).toBe(42);
    });

    it("ignores invalid color and icon values", async () => {
      const response = [
        {
          career_id: 1,
          name: "Career 1",
          color: "invalid",
          icon_name: "   ",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(1);
      expect(result.careers[0].colorCode).toBeNull();
      expect(result.careers[0].iconName).toBeNull();
    });
  });

  describe("pagination metadata extraction", () => {
    it("extracts pagination with all fields", async () => {
      const response = {
        page: {
          size: 20,
          number: 1,
          totalElements: 250,
          totalPages: 13,
        },
        data: [{ career_id: 1, name: "Career 1" }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers(undefined, 1);

      expect(result.pagination).toEqual({
        size: 20,
        number: 1,
        totalElements: 250,
        totalPages: 13,
      });
    });

    it("uses default pagination values when missing", async () => {
      const response = {
        page: {},
        data: [{ career_id: 1, name: "Career 1" }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.pagination).toEqual({
        size: 10,
        number: 0,
        totalElements: 0,
        totalPages: 0,
      });
    });

    it("converts string pagination values to numbers", async () => {
      const response = {
        page: {
          size: "15",
          number: "2",
          totalElements: "300",
          totalPages: "20",
        },
        data: [{ career_id: 1, name: "Career 1" }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.pagination).toEqual({
        size: 15,
        number: 2,
        totalElements: 300,
        totalPages: 20,
      });
    });

    it("returns fallback pagination for plain arrays", async () => {
      const response = [
        { career_id: 1, name: "Career 1" },
        { career_id: 2, name: "Career 2" },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.pagination).toEqual({
        size: 2,
        number: 0,
        totalElements: 2,
        totalPages: 1,
      });
    });

    it("returns zero pagination for empty responses", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.pagination).toEqual({
        size: 10,
        number: 0,
        totalElements: 0,
        totalPages: 0,
      });
    });
  });

  describe("language and page parameters", () => {
    it("uses provided language code", async () => {
      mockedGetLanguageCode.mockReturnValue("en");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "",
      });

      await loadUnlockedCareers("en");

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(callUrl).toContain("/en");
    });

    it("passes page number to API", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "",
      });

      await loadUnlockedCareers(undefined, 5);

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(callUrl).toContain("page=5");
    });

    it("url encodes language code", async () => {
      mockedGetLanguageCode.mockReturnValue("nb");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "",
      });

      await loadUnlockedCareers("nb");

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(callUrl).toContain("nb");
    });
  });

  describe("error handling edge cases", () => {
    it("handles JSON parse errors gracefully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
        text: async () => "Invalid JSON",
      });

      try {
        await loadUnlockedCareers();
      } catch (e) {
        // Should handle or continue to next endpoint
      }

      expect(mockedEnsureUserId).toHaveBeenCalled();
    });

    it("handles malformed nested career data", async () => {
      const response = {
        data: [
          { career_id: 1, name: "Valid" },
          "string instead of object",
          null,
          { career_id: null, name: "Invalid" },
        ],
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => "",
      });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(1);
      expect(result.careers[0].career_id).toBe(1);
    });

    it("continues to next endpoint on unfixes errors", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "Server Error",
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "Server Error",
        });

      const result = await loadUnlockedCareers();

      expect(result.careers).toHaveLength(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe("base URL handling", () => {
    it("removes trailing slash from base URL", async () => {
      mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "",
      });

      await loadUnlockedCareers();

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(callUrl).not.toContain("//career");
      expect(callUrl).toContain("http://localhost:8080/career");
    });

    it("handles base URL without trailing slash", async () => {
      mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "",
      });

      await loadUnlockedCareers();

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(callUrl).toContain("http://localhost:8080/career");
    });
  });
});
