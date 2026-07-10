/**
 * Recursively deep merges an object from the server with a fallback object.
 * Arrays are replaced entirely by the server value if it exists and is an array.
 * Objects are recursively merged.
 * Primitives take the server value if !== undefined, else fallback.
 */
export function deepMerge<T>(fromServer: any, fallback: T): T {
  if (fromServer === undefined || fromServer === null) {
    return fallback;
  }

  if (typeof fallback !== "object" || fallback === null) {
    return fromServer !== undefined ? fromServer : fallback;
  }

  if (Array.isArray(fallback)) {
    return (Array.isArray(fromServer) ? fromServer : fallback) as unknown as T;
  }

  // Both are objects
  const result = { ...fallback } as any;

  if (typeof fromServer === "object" && fromServer !== null) {
    for (const key of Object.keys(fallback)) {
      if (fromServer[key] !== undefined) {
        result[key] = deepMerge(fromServer[key], (fallback as any)[key]);
      }
    }
    // Include keys that are only in fromServer
    for (const key of Object.keys(fromServer)) {
      if (!(key in fallback)) {
        result[key] = fromServer[key];
      }
    }
  }

  return result as T;
}
