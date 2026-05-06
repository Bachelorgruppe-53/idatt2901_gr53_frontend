// Minimal mock for expo-modules-core/src/polyfill/dangerous-internal used by jest-expo
if (!globalThis.expo) {
  class EventEmitter {
    addListener() {
      return { remove() {} };
    }
    removeAllListeners() {}
  }
  globalThis.expo = { EventEmitter };
}

function installExpoGlobalPolyfill() {
  // no-op for tests
}

module.exports = {
  installExpoGlobalPolyfill,
};
