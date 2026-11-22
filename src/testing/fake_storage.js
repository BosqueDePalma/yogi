// An in-memory stand-in for localStorage, for tests. `refuseWrites(true)` makes every
// write throw, as a full or blocked localStorage does.
export function fakeStorage(items = {}) {
  const data = new Map(Object.entries(items));
  let refusing = false;
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      if (refusing) throw new DOMException("full", "QuotaExceededError");
      data.set(key, String(value));
    },
    removeItem: (key) => data.delete(key),
    items: () => Object.fromEntries(data),
    refuseWrites: (refuse) => {
      refusing = refuse;
    },
  };
}
