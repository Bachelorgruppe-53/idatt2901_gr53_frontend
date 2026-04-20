import { createThemedStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/src/hooks/useThemeColor");
jest.mock("@/src/constants/Styles", () => ({
  createThemedStyles: jest.fn(),
}));

const mockedUseThemeColor = useThemeColor as jest.MockedFunction<
  typeof useThemeColor
>;
const mockedCreateThemedStyles = createThemedStyles as jest.MockedFunction<
  typeof createThemedStyles
>;

describe("useThemedStyles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates themed styles using current theme", () => {
    const theme = { background: "#fff" } as any;
    const styles = { container: { backgroundColor: "#fff" } } as any;

    mockedUseThemeColor.mockReturnValue(theme);
    mockedCreateThemedStyles.mockReturnValue(styles);

    const { result } = renderHook(() => useThemedStyles());

    expect(mockedCreateThemedStyles).toHaveBeenCalledWith(theme);
    expect(result.current).toBe(styles);
  });

  it("memoizes styles for same theme", () => {
    const theme = { background: "#000" } as any;
    const styles = { container: { backgroundColor: "#000" } } as any;

    mockedUseThemeColor.mockReturnValue(theme);
    mockedCreateThemedStyles.mockReturnValue(styles);

    const { result, rerender } = renderHook(() => useThemedStyles());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
