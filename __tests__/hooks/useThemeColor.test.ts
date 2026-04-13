import { Colors } from "@/src/constants/Colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/src/context/ThemeContext");

const mockedUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe("useThemeColor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns light colors when dark mode is disabled", () => {
    mockedUseTheme.mockReturnValue({ isDarkMode: false } as any);

    const { result } = renderHook(() => useThemeColor());

    expect(result.current).toEqual(Colors.light);
  });

  it("returns dark colors when dark mode is enabled", () => {
    mockedUseTheme.mockReturnValue({ isDarkMode: true } as any);

    const { result } = renderHook(() => useThemeColor());

    expect(result.current).toEqual(Colors.dark);
  });
});
