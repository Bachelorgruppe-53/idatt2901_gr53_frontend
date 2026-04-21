import QuizModal from "@/src/components/quiz/quizModal";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { act, render } from "@testing-library/react-native";
import { useTranslation } from "react-i18next";

jest.mock("@/src/components/quiz/quiz", () => () => null);
jest.mock("@/src/hooks/useThemeColor", () => ({
  useThemeColor: jest.fn(),
}));
jest.mock("@/src/hooks/useStyleSheet", () => ({
  useThemedStyles: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

const mockedUseThemeColor = useThemeColor as jest.MockedFunction<
  typeof useThemeColor
>;
const mockedUseThemedStyles = useThemedStyles as jest.MockedFunction<
  typeof useThemedStyles
>;
const mockedUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

describe("QuizModal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockedUseThemeColor.mockReturnValue({
      background: "#fff",
      backgroundSecondary: "#f4f4f4",
      border: "#ddd",
      text: "#111",
      placeholder: "#666",
      button: "#000",
    } as any);

    mockedUseThemedStyles.mockReturnValue({
      container: {},
      content: {},
      heading: {},
      closeButton: {},
      semiboldText: {},
      text: {},
      button: {},
      buttonText: {},
    } as any);

    mockedUseTranslation.mockReturnValue({
      t: (key: string, fallback?: string) => fallback ?? key,
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows a countdown timer and updates every second", async () => {
    const onClose = jest.fn();
    const startedAt = Date.now();

    const { getByText } = render(
      <QuizModal
        visible
        title="Quiz title"
        questions={[]}
        timeLimit={90}
        startedAt={startedAt}
        onAnswer={jest.fn()}
        onClose={onClose}
      />,
    );

    expect(getByText("Time left: 01:30")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText("Time left: 00:29")).toBeTruthy();
  });

  it("keeps modal open and shows message when countdown reaches zero", async () => {
    const onClose = jest.fn();
    const startedAt = Date.now();

    const { getByText } = render(
      <QuizModal
        visible
        title="Quiz title"
        questions={[]}
        timeLimit={1}
        startedAt={startedAt}
        onAnswer={jest.fn()}
        onClose={onClose}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText("Time left: 00:00")).toBeTruthy();
    expect(getByText("Be faster next time")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
