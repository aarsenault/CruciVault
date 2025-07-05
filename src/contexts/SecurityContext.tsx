import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

interface SecurityContextType {
  isLocked: boolean;
  mnemonic: string | null;
  lockApp: () => void;
  unlockApp: (mnemonic: string) => void;
  getMnemonic: () => string | null;
  clearMnemonic: () => void;
  resetActivityTimer: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

interface SecurityProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    chrome?: {
      storage?: {
        sync?: {
          get: (keys: string[], cb: (result: any) => void) => void;
          set: (data: any, cb: () => void) => void;
        };
      };
    };
  }
}

// Helper to get storage (sync in extension, localStorage in dev)
const getStorage = () => {
  if (window.chrome?.storage?.sync) {
    return {
      get: (keys: string[]) =>
        new Promise<any>((resolve) =>
          window.chrome!.storage!.sync!.get(keys, resolve)
        ),
      set: (data: any) =>
        new Promise<void>((resolve) =>
          window.chrome!.storage!.sync!.set(data, resolve)
        ),
    };
  } else {
    // Fallback for dev: use localStorage
    return {
      get: async (keys: string[]) => {
        const result: any = {};
        keys.forEach((key) => {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              // Try to parse as JSON first
              result[key] = JSON.parse(val);
            } catch {
              // If parsing fails, use the raw value
              result[key] = val;
            }
          } else {
            result[key] = undefined;
          }
        });
        return result;
      },
      set: async (data: any) => {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      },
    };
  }
};

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
}) => {
  const [isLocked, setIsLocked] = useState(true); // Start locked by default
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [lockTimer, setLockTimer] = useState<NodeJS.Timeout | null>(null);
  const [lockTimerMinutes, setLockTimerMinutes] = useState(5);

  // Load settings and check wallet state on mount
  useEffect(() => {
    loadSettings();
    checkWalletState();
  }, []);

  // Set up activity listeners
  useEffect(() => {
    const resetTimer = () => {
      if (!isLocked) {
        resetActivityTimer();
      }
    };
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isLocked]);

  const loadSettings = async () => {
    try {
      const stored = await getStorage().get(["appSettings"]);
      if (stored.appSettings?.lockTimerMinutes) {
        setLockTimerMinutes((prev) =>
          prev !== stored.appSettings.lockTimerMinutes
            ? stored.appSettings.lockTimerMinutes
            : prev
        );
      }
    } catch (error) {
      console.error("Failed to load security settings:", error);
    }
  };

  const checkWalletState = async () => {
    try {
      const stored = await getStorage().get(["encryptedMnemonic"]);
      // If no mnemonic exists, the app should not be locked (show wallet setup)
      if (!stored.encryptedMnemonic) {
        setIsLocked((prev) => (prev !== false ? false : prev));
      }
      // If mnemonic exists, stay locked until user unlocks
    } catch (error) {
      console.error("Failed to check wallet state:", error);
      // On error, assume no wallet exists
      setIsLocked((prev) => (prev !== false ? false : prev));
    }
  };

  const resetActivityTimer = () => {
    if (lockTimer) {
      clearTimeout(lockTimer);
    }
    const timer = setTimeout(() => {
      lockApp();
    }, lockTimerMinutes * 60 * 1000);
    setLockTimer(timer);
  };

  const lockApp = () => {
    setIsLocked((prev) => (prev !== true ? true : prev));
    setMnemonic((prev) => (prev !== null ? null : prev)); // Clear mnemonic from memory
    if (lockTimer) {
      clearTimeout(lockTimer);
      setLockTimer(null);
    }
    // Let AppRouter handle navigation based on lock state
  };

  const unlockApp = (newMnemonic: string) => {
    setIsLocked((prev) => (prev !== false ? false : prev));
    setMnemonic((prev) => (prev !== newMnemonic ? newMnemonic : prev));
    resetActivityTimer();
  };

  const getMnemonic = (): string | null => {
    if (isLocked) {
      return null; // Never return mnemonic when locked
    }
    return mnemonic;
  };

  const clearMnemonic = () => {
    setMnemonic((prev) => (prev !== null ? null : prev));
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<SecurityContextType>(
    () => ({
      isLocked,
      mnemonic,
      lockApp,
      unlockApp,
      getMnemonic,
      clearMnemonic,
      resetActivityTimer,
    }),
    [isLocked, mnemonic]
  );

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
