/**
 * This module defines a simple event system for handling career claim events in the app. 
 * It allows components to subscribe to career claim events and be notified when a career is claimed.
 */

type CareerClaimedListener = (careerId: number) => void;

const listeners = new Set<CareerClaimedListener>();

/**
 * Emits a career claimed event to all registered listeners with the given career ID.
 * @param careerId - The ID of the career that was claimed.
 */
export function emitCareerClaimed(careerId: number) {
  for (const listener of Array.from(listeners)) {
    try {
      listener(careerId);
    } catch (error) {
      console.warn("[CareerClaimEvents] Listener failed", error);
    }
  }
}

/**
 * Subscribes to career claimed events.
 * @param listener - The listener function to be called when a career is claimed.
 * @returns A function to unsubscribe the listener.
 */
export function subscribeToCareerClaimed(listener: CareerClaimedListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
