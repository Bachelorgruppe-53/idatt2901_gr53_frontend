import { useQRScanner } from "@/src/hooks/useQRScanner";
import { act, renderHook } from "@testing-library/react-native";
import { useCameraPermissions } from "expo-camera";

jest.mock("expo-camera", () => ({
  useCameraPermissions: jest.fn(),
}));

const mockedUseCameraPermissions = useCameraPermissions as jest.MockedFunction<
  typeof useCameraPermissions
>;

describe("useQRScanner", () => {
  const getPermission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false and sets permissionError when permission object is missing", async () => {
    const requestPermission = jest.fn();
    mockedUseCameraPermissions.mockReturnValue([
      undefined as any,
      requestPermission,
      getPermission,
    ]);

    const { result } = renderHook(() => useQRScanner());

    let started = false;
    await act(async () => {
      started = await result.current.startScanning();
    });

    expect(started).toBe(false);
    expect(result.current.permissionError).toBe(true);
    expect(result.current.isScanning).toBe(false);
  });

  it("requests permission when not granted and starts scanning on success", async () => {
    const requestPermission = jest.fn().mockResolvedValue({ granted: true });
    mockedUseCameraPermissions.mockReturnValue([
      { granted: false } as any,
      requestPermission,
      getPermission,
    ]);

    const { result } = renderHook(() => useQRScanner());

    let started = false;
    await act(async () => {
      started = await result.current.startScanning();
    });

    expect(requestPermission).toHaveBeenCalled();
    expect(started).toBe(true);
    expect(result.current.permissionError).toBe(false);
    expect(result.current.isScanning).toBe(true);
  });

  it("returns false when permission request is denied", async () => {
    const requestPermission = jest.fn().mockResolvedValue({ granted: false });
    mockedUseCameraPermissions.mockReturnValue([
      { granted: false } as any,
      requestPermission,
      getPermission,
    ]);

    const { result } = renderHook(() => useQRScanner());

    let started = false;
    await act(async () => {
      started = await result.current.startScanning();
    });

    expect(started).toBe(false);
    expect(result.current.permissionError).toBe(true);
    expect(result.current.isScanning).toBe(false);
  });

  it("starts scanning immediately when permission already granted", async () => {
    const requestPermission = jest.fn();
    mockedUseCameraPermissions.mockReturnValue([
      { granted: true } as any,
      requestPermission,
      getPermission,
    ]);

    const { result } = renderHook(() => useQRScanner());

    await act(async () => {
      await result.current.startScanning();
    });

    expect(requestPermission).not.toHaveBeenCalled();
    expect(result.current.isScanning).toBe(true);
    expect(result.current.permissionError).toBe(false);
  });

  it("stops scanning", () => {
    const requestPermission = jest.fn();
    mockedUseCameraPermissions.mockReturnValue([
      { granted: true } as any,
      requestPermission,
      getPermission,
    ]);

    const { result } = renderHook(() => useQRScanner());

    act(() => {
      result.current.stopScanning();
    });

    expect(result.current.isScanning).toBe(false);
  });
});
