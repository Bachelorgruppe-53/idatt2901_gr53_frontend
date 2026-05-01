// Minimal mock for expo-modules-core package
class EventEmitter {
  addListener() {
    return { remove() {} };
  }
  removeAllListeners() {}
}

class NativeModule {
  constructor() {}
}

class SharedObject {
  constructor() {}
}

// Ensure required constructors exist even if another mock initialized globalThis.expo first.
if (!globalThis.expo) {
  globalThis.expo = {};
}
if (!globalThis.expo.EventEmitter) {
  globalThis.expo.EventEmitter = EventEmitter;
}
if (!globalThis.expo.NativeModule) {
  globalThis.expo.NativeModule = NativeModule;
}
if (!globalThis.expo.SharedObject) {
  globalThis.expo.SharedObject = SharedObject;
}

function installExpoGlobalPolyfill() {
  // no-op for tests
}

// Minimal NativeModulesProxy and optional loader for tests
const NativeModulesProxy = {};
function requireOptionalNativeModule(name) {
  // Provide minimal native implementations used in tests
  if (name === "ExpoSecureStore") {
    return {
      getItemAsync: async (key) => null,
      setItemAsync: async (key, value) => {},
      deleteItemAsync: async (key) => {},
    };
  }
  if (name === "ExpoFontLoader") {
    return {
      loadAsync: async () => {},
    };
  }
  return null;
}

module.exports = {
  installExpoGlobalPolyfill,
  NativeModulesProxy,
  requireOptionalNativeModule,
};
