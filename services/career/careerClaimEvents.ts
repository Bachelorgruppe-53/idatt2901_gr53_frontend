type CareerClaimedListener = (careerId: number) => void;

const listeners = new Set<CareerClaimedListener>();

export function emitCareerClaimed(careerId: number) {
  for (const listener of Array.from(listeners)) {
    try {
      listener(careerId);
    } catch (error) {
      console.warn("[CareerClaimEvents] Listener failed", error);
    }
  }
}

export function subscribeToCareerClaimed(listener: CareerClaimedListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function __resetCareerClaimedListenersForTests() {
  listeners.clear();
}
