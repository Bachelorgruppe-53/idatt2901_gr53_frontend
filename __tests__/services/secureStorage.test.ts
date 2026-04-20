import {
    clearUserData,
    deleteFavoriteCareer,
    deleteNickname,
    deleteUserId,
    getFavoriteCareer,
    getLanguagePreference,
    getNickname,
    getThemePreference,
    getUserId,
    saveFavoriteCareer,
    saveLanguagePreference,
    saveNickname,
    saveThemePreference,
    saveUserId,
} from "@/services/utils/secureStorage";
import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockedGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockedDeleteItemAsync =
  SecureStore.deleteItemAsync as jest.MockedFunction<
    typeof SecureStore.deleteItemAsync
  >;

describe("secureStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSetItemAsync.mockResolvedValue(undefined);
    mockedGetItemAsync.mockResolvedValue(null);
    mockedDeleteItemAsync.mockResolvedValue(undefined);
  });

  it("saves and retrieves user id", async () => {
    mockedGetItemAsync.mockResolvedValue("user-1");

    await saveUserId("user-1");
    const userId = await getUserId();

    expect(mockedSetItemAsync).toHaveBeenCalledWith("user_id", "user-1");
    expect(mockedGetItemAsync).toHaveBeenCalledWith("user_id");
    expect(userId).toBe("user-1");
  });

  it("returns null if get user id fails", async () => {
    mockedGetItemAsync.mockRejectedValue(new Error("boom"));

    await expect(getUserId()).resolves.toBeNull();
  });

  it("throws if save user id fails", async () => {
    mockedSetItemAsync.mockRejectedValue(new Error("save failed"));

    await expect(saveUserId("user-1")).rejects.toThrow("save failed");
  });

  it("deletes user id", async () => {
    await deleteUserId();

    expect(mockedDeleteItemAsync).toHaveBeenCalledWith("user_id");
  });

  it("throws if delete user id fails", async () => {
    mockedDeleteItemAsync.mockRejectedValue(new Error("delete failed"));

    await expect(deleteUserId()).rejects.toThrow("delete failed");
  });

  it("saves and retrieves nickname", async () => {
    mockedGetItemAsync.mockResolvedValue("Alice");

    await saveNickname("Alice");
    const nickname = await getNickname();

    expect(mockedSetItemAsync).toHaveBeenCalledWith("user_nickname", "Alice");
    expect(nickname).toBe("Alice");
  });

  it("deletes nickname", async () => {
    await deleteNickname();

    expect(mockedDeleteItemAsync).toHaveBeenCalledWith("user_nickname");
  });

  it("throws if save nickname fails", async () => {
    mockedSetItemAsync.mockRejectedValue(new Error("save nickname failed"));

    await expect(saveNickname("Alice")).rejects.toThrow("save nickname failed");
  });

  it("returns null if get nickname fails", async () => {
    mockedGetItemAsync.mockRejectedValue(new Error("nickname failed"));

    await expect(getNickname()).resolves.toBeNull();
  });

  it("throws if delete nickname fails", async () => {
    mockedDeleteItemAsync.mockRejectedValue(
      new Error("delete nickname failed"),
    );

    await expect(deleteNickname()).rejects.toThrow("delete nickname failed");
  });

  it("saves and retrieves language preference", async () => {
    mockedGetItemAsync.mockResolvedValue("nb");

    await saveLanguagePreference("nb");
    const language = await getLanguagePreference();

    expect(mockedSetItemAsync).toHaveBeenCalledWith("app_language", "nb");
    expect(language).toBe("nb");
  });

  it("throws if save language preference fails", async () => {
    mockedSetItemAsync.mockRejectedValue(new Error("save language failed"));

    await expect(saveLanguagePreference("nb")).rejects.toThrow(
      "save language failed",
    );
  });

  it("returns null if get language preference fails", async () => {
    mockedGetItemAsync.mockRejectedValue(new Error("get language failed"));

    await expect(getLanguagePreference()).resolves.toBeNull();
  });

  it("saves and retrieves theme preference", async () => {
    mockedGetItemAsync.mockResolvedValue("dark");

    await saveThemePreference("dark");
    const theme = await getThemePreference();

    expect(mockedSetItemAsync).toHaveBeenCalledWith("app_theme_mode", "dark");
    expect(theme).toBe("dark");
  });

  it("throws if save theme preference fails", async () => {
    mockedSetItemAsync.mockRejectedValue(new Error("save theme failed"));

    await expect(saveThemePreference("dark")).rejects.toThrow(
      "save theme failed",
    );
  });

  it("returns null if get theme preference fails", async () => {
    mockedGetItemAsync.mockRejectedValue(new Error("get theme failed"));

    await expect(getThemePreference()).resolves.toBeNull();
  });

  it("saves and retrieves favorite career", async () => {
    const favoriteCareer = { id: 7, title: "Nurse" };
    mockedGetItemAsync.mockResolvedValue(JSON.stringify(favoriteCareer));

    await saveFavoriteCareer(favoriteCareer);
    const savedCareer = await getFavoriteCareer();

    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      "favorite_career",
      JSON.stringify(favoriteCareer),
    );
    expect(savedCareer).toEqual(favoriteCareer);
  });

  it("returns null for invalid favorite career payload", async () => {
    mockedGetItemAsync.mockResolvedValue(
      JSON.stringify({ title: "Missing ID" }),
    );

    const career = await getFavoriteCareer();

    expect(career).toBeNull();
  });

  it("returns null for malformed favorite career json", async () => {
    mockedGetItemAsync.mockResolvedValue("not-json");

    const career = await getFavoriteCareer();

    expect(career).toBeNull();
  });

  it("returns null if reading favorite career fails", async () => {
    mockedGetItemAsync.mockRejectedValue(new Error("favorite read failed"));

    await expect(getFavoriteCareer()).resolves.toBeNull();
  });

  it("throws if saving favorite career fails", async () => {
    mockedSetItemAsync.mockRejectedValue(new Error("favorite save failed"));

    await expect(saveFavoriteCareer({ id: 7, title: "Nurse" })).rejects.toThrow(
      "favorite save failed",
    );
  });

  it("deletes favorite career", async () => {
    await deleteFavoriteCareer();

    expect(mockedDeleteItemAsync).toHaveBeenCalledWith("favorite_career");
  });

  it("throws if deleting favorite career fails", async () => {
    mockedDeleteItemAsync.mockRejectedValue(
      new Error("favorite delete failed"),
    );

    await expect(deleteFavoriteCareer()).rejects.toThrow(
      "favorite delete failed",
    );
  });

  it("clears user-scoped data", async () => {
    await clearUserData();

    expect(mockedDeleteItemAsync).toHaveBeenCalledWith("user_nickname");
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith("favorite_career");
  });

  it("throws if clear user data fails", async () => {
    mockedDeleteItemAsync.mockRejectedValue(new Error("clear failed"));

    await expect(clearUserData()).rejects.toThrow("clear failed");
  });
});
