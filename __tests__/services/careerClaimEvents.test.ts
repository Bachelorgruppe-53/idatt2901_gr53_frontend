import {
    __resetCareerClaimedListenersForTests,
    emitCareerClaimed,
    subscribeToCareerClaimed,
} from "@/services/career/careerClaimEvents";

describe("careerClaimEvents", () => {
  beforeEach(() => {
    __resetCareerClaimedListenersForTests();
  });

  describe("emitCareerClaimed", () => {
    it("calls all registered listeners with career ID", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      subscribeToCareerClaimed(listener1);
      subscribeToCareerClaimed(listener2);

      emitCareerClaimed(42);

      expect(listener1).toHaveBeenCalledWith(42);
      expect(listener2).toHaveBeenCalledWith(42);
    });

    it("calls listeners with correct career ID", () => {
      const listener = jest.fn();
      subscribeToCareerClaimed(listener);

      emitCareerClaimed(100);
      expect(listener).toHaveBeenCalledWith(100);

      emitCareerClaimed(200);
      expect(listener).toHaveBeenCalledWith(200);

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("handles multiple emit calls", () => {
      const listener = jest.fn();
      subscribeToCareerClaimed(listener);

      emitCareerClaimed(1);
      emitCareerClaimed(2);
      emitCareerClaimed(3);

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 1);
      expect(listener).toHaveBeenNthCalledWith(2, 2);
      expect(listener).toHaveBeenNthCalledWith(3, 3);
    });

    it("does not fail when no listeners are registered", () => {
      expect(() => {
        emitCareerClaimed(42);
      }).not.toThrow();
    });

    it("handles listener that throws error gracefully", () => {
      const error = new Error("Listener error");
      const failingListener = jest.fn(() => {
        throw error;
      });
      const successfulListener = jest.fn();

      subscribeToCareerClaimed(failingListener);
      subscribeToCareerClaimed(successfulListener);

      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      emitCareerClaimed(42);

      expect(failingListener).toHaveBeenCalledWith(42);
      expect(successfulListener).toHaveBeenCalledWith(42);
      expect(warnSpy).toHaveBeenCalledWith(
        "[CareerClaimEvents] Listener failed",
        error,
      );

      warnSpy.mockRestore();
    });

    it("continues calling listeners after one throws error", () => {
      const listener1 = jest.fn(() => {
        throw new Error("Error in listener 1");
      });
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      subscribeToCareerClaimed(listener1);
      subscribeToCareerClaimed(listener2);
      subscribeToCareerClaimed(listener3);

      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      emitCareerClaimed(42);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe("subscribeToCareerClaimed", () => {
    it("registers a listener and returns unsubscribe function", () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToCareerClaimed(listener);

      expect(typeof unsubscribe).toBe("function");

      emitCareerClaimed(42);
      expect(listener).toHaveBeenCalledWith(42);
    });

    it("unsubscribe removes listener from registry", () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToCareerClaimed(listener);

      emitCareerClaimed(42);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      emitCareerClaimed(43);
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it("deduplicates listeners when subscribing same listener twice", () => {
      const listener = jest.fn();

      subscribeToCareerClaimed(listener);
      subscribeToCareerClaimed(listener);

      emitCareerClaimed(42);

      // Listener is only stored once in the Set, so called once not twice
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(42);
    });

    it("deduplication is based on listener reference", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      subscribeToCareerClaimed(listener1);
      subscribeToCareerClaimed(listener2);
      subscribeToCareerClaimed(listener1); // Same reference as first

      emitCareerClaimed(42);

      // listener1 is only called once (deduped), listener2 called once
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("supports registering multiple different listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      subscribeToCareerClaimed(listener1);
      subscribeToCareerClaimed(listener2);
      subscribeToCareerClaimed(listener3);

      emitCareerClaimed(42);

      expect(listener1).toHaveBeenCalledWith(42);
      expect(listener2).toHaveBeenCalledWith(42);
      expect(listener3).toHaveBeenCalledWith(42);
    });

    it("listener receives correct career ID values", () => {
      const listener = jest.fn();
      subscribeToCareerClaimed(listener);

      const careerIds = [1, 99, 12345, 0, -1];

      careerIds.forEach((id) => {
        emitCareerClaimed(id);
      });

      careerIds.forEach((id, index) => {
        expect(listener).toHaveBeenNthCalledWith(index + 1, id);
      });
    });
  });

  describe("subscriber isolation", () => {
    it("subscribers registered after event don't receive past events", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      subscribeToCareerClaimed(listener1);
      emitCareerClaimed(1);

      subscribeToCareerClaimed(listener2);
      emitCareerClaimed(2);

      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener1).toHaveBeenNthCalledWith(1, 1);
      expect(listener1).toHaveBeenNthCalledWith(2, 2);

      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledWith(2);
    });

    it("unsubscribed listeners don't receive new events", () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToCareerClaimed(listener);

      emitCareerClaimed(1);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      emitCareerClaimed(2);
      emitCareerClaimed(3);
      emitCareerClaimed(4);

      expect(listener).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe("edge cases", () => {
    it("handles zero career ID", () => {
      const listener = jest.fn();
      subscribeToCareerClaimed(listener);

      emitCareerClaimed(0);

      expect(listener).toHaveBeenCalledWith(0);
    });

    it("handles negative career ID", () => {
      const listener = jest.fn();
      subscribeToCareerClaimed(listener);

      emitCareerClaimed(-1);

      expect(listener).toHaveBeenCalledWith(-1);
    });

    it("handles large career ID", () => {
      const listener = jest.fn();
      subscribeToCareerClaimed(listener);

      emitCareerClaimed(999999999);

      expect(listener).toHaveBeenCalledWith(999999999);
    });

    it("unsubscribe can be called multiple times safely", () => {
      const listener = jest.fn();
      const unsubscribe = subscribeToCareerClaimed(listener);

      emitCareerClaimed(1);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      unsubscribe();
      unsubscribe();

      emitCareerClaimed(2);
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
    });
  });
});
