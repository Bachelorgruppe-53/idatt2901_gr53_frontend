import { getApiBaseUrl } from "@/services/apiConfig";
import { loadUnlockedCareers } from "@/services/career/loadUnlockedCareers";

jest.mock("@/services/apiConfig", () => ({
  getApiBaseUrl: jest.fn(),
}));

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;

describe("loadUnlockedCareers", () => {
  beforeEach(() => {
    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    global.fetch = jest.fn();
  });

  it("loads unlocked careers successfully", async () => {
    const careersPayload = [
      {
        id: "career1",
        name: "Career 1",
        description: "Description for Career 1",
      },
      {
        id: "career2",
        name: "Career 2",
        description: "Description for Career 2",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => careersPayload,
    });

    const result = await loadUnlockedCareers();
    expect(result).toEqual(careersPayload);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/careers/unlocked",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("throws an error when the API response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    await expect(loadUnlockedCareers()).rejects.toThrow(
      "Failed to load unlocked careers: Internal Server Error",
    );
  });
});

