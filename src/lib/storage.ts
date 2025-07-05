// Storage utility for Chrome extension
// Sensitive data goes to chrome.storage.local
// Non-sensitive data goes to chrome.storage.sync

declare global {
  interface Window {
    chrome?: {
      storage?: {
        sync?: {
          get: (
            keys: string[],
            cb: (result: Record<string, unknown>) => void
          ) => void;
          set: (data: Record<string, unknown>, cb: () => void) => void;
          remove: (keys: string[], cb: () => void) => void;
          clear: (cb: () => void) => void;
        };
        local?: {
          get: (
            keys: string[],
            cb: (result: Record<string, unknown>) => void
          ) => void;
          set: (data: Record<string, unknown>, cb: () => void) => void;
          remove: (keys: string[], cb: () => void) => void;
          clear: (cb: () => void) => void;
        };
      };
    };
  }
}

// Sensitive data keys that should be stored in local storage
const SENSITIVE_KEYS = ["encryptedMnemonic"];

// Helper to determine if a key contains sensitive data
const isSensitiveKey = (key: string): boolean => {
  return SENSITIVE_KEYS.includes(key);
};

export const storage = {
  // Get data from storage
  get: async (keys: string[]): Promise<Record<string, unknown>> => {
    if (!window.chrome?.storage) {
      throw new Error("Chrome storage API not available");
    }

    // Group keys by storage type
    const sensitiveKeys = keys.filter(isSensitiveKey);
    const nonSensitiveKeys = keys.filter((key) => !isSensitiveKey(key));

    const result: Record<string, unknown> = {};

    // Get sensitive data from local storage
    if (sensitiveKeys.length > 0) {
      const sensitiveResult = await new Promise<Record<string, unknown>>(
        (resolve) => {
          window.chrome!.storage!.local!.get(sensitiveKeys, resolve);
        }
      );
      Object.assign(result, sensitiveResult);
    }

    // Get non-sensitive data from sync storage
    if (nonSensitiveKeys.length > 0) {
      const nonSensitiveResult = await new Promise<Record<string, unknown>>(
        (resolve) => {
          window.chrome!.storage!.sync!.get(nonSensitiveKeys, resolve);
        }
      );
      Object.assign(result, nonSensitiveResult);
    }

    return result;
  },

  // Set data in storage
  set: async (data: Record<string, unknown>): Promise<void> => {
    if (!window.chrome?.storage) {
      throw new Error("Chrome storage API not available");
    }

    // Separate sensitive and non-sensitive data
    const sensitiveData: Record<string, unknown> = {};
    const nonSensitiveData: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (isSensitiveKey(key)) {
        sensitiveData[key] = value;
      } else {
        nonSensitiveData[key] = value;
      }
    });

    // Store sensitive data in local storage
    if (Object.keys(sensitiveData).length > 0) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local!.set(sensitiveData, resolve);
      });
    }

    // Store non-sensitive data in sync storage
    if (Object.keys(nonSensitiveData).length > 0) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.sync!.set(nonSensitiveData, resolve);
      });
    }
  },

  // Remove data from storage
  remove: async (keys: string[]): Promise<void> => {
    if (!window.chrome?.storage) {
      throw new Error("Chrome storage API not available");
    }

    // Group keys by storage type
    const sensitiveKeys = keys.filter(isSensitiveKey);
    const nonSensitiveKeys = keys.filter((key) => !isSensitiveKey(key));

    // Remove sensitive data from local storage
    if (sensitiveKeys.length > 0) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local!.remove(sensitiveKeys, resolve);
      });
    }

    // Remove non-sensitive data from sync storage
    if (nonSensitiveKeys.length > 0) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.sync!.remove(nonSensitiveKeys, resolve);
      });
    }
  },

  // Clear all data
  clear: async (): Promise<void> => {
    if (!window.chrome?.storage) {
      throw new Error("Chrome storage API not available");
    }

    // Clear both local and sync storage
    await Promise.all([
      new Promise<void>((resolve) => {
        window.chrome!.storage!.local!.clear(resolve);
      }),
      new Promise<void>((resolve) => {
        window.chrome!.storage!.sync!.clear(resolve);
      }),
    ]);
  },
};
