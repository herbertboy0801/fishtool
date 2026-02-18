const PREFIX = "xianyu_";

function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

export const store = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = localStorage.getItem(getKey(key));
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getKey(key));
  },

  clear(): void {
    if (typeof window === "undefined") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

// Typed collection helpers with capacity limits
export function addToCollection<T extends { id?: string }>(
  key: string,
  item: T,
  maxItems: number = 50
): void {
  const items = store.get<T[]>(key, []);
  const newItem = {
    ...item,
    id: item.id ?? crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const updated = [newItem, ...items].slice(0, maxItems);
  store.set(key, updated);
}

export function removeFromCollection<T extends { id?: string }>(
  key: string,
  id: string
): void {
  const items = store.get<T[]>(key, []);
  store.set(
    key,
    items.filter((item) => item.id !== id)
  );
}
