import { useCameraPermissions } from "expo-camera";
import { useState, useCallback } from "react";

/**
 * Custom hook to manage QR code scanning functionality.
 * It handles camera permissions and scanning state.
 * 
 * @returns An object containing scanning state and control functions.
 */

interface QRScannerResult {
    isScanning: boolean;
    startScanning: () => Promise<boolean>;
    stopScanning: () => void;
    permission: ReturnType<typeof useCameraPermissions>[0];
    permissionError: boolean;
}

export function useQRScanner(): QRScannerResult {
    const [isScanning, setIsScanning] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const startScanning = useCallback(async (): Promise<boolean> => {
        if (!permission) {
            setPermissionError(true);
            return false;
        }

        if (!permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                setPermissionError(true);
                return false;
            }
        }
        
        setPermissionError(false);
        setIsScanning(true);
        return true;
    }, [permission, requestPermission]);

    const stopScanning = useCallback(() => {
        setIsScanning(false);
    }, []);

    return {
        isScanning,
        startScanning,
        stopScanning,
        permission,
        permissionError,
    };
}