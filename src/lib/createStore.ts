type Listener = () => void;

export function createStore<T>(storageKey: string, initial: T) {
  let state: T = initial;
  let hydrated = false;
  const listeners = new Set<Listener>();

  function hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) state = JSON.parse(raw) as T;
    } catch {
      // ignore corrupt/unavailable storage
    }
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore quota/private-browsing errors
    }
  }

  return {
    getSnapshot(): T {
      hydrate();
      return state;
    },
    getServerSnapshot(): T {
      return initial;
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState(updater: (prev: T) => T) {
      state = updater(state);
      persist();
      listeners.forEach((listener) => listener());
    },
  };
}
