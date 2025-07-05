import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
          result[key] = val ? JSON.parse(val) : undefined;
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
  const navigate = useNavigate();
  const location = useLocation();

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

    // Listen for user activity
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
        setLockTimerMinutes(stored.appSettings.lockTimerMinutes);
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
        setIsLocked(false);
      }
      // If mnemonic exists, stay locked until user unlocks
    } catch (error) {
      console.error("Failed to check wallet state:", error);
      // On error, assume no wallet exists
      setIsLocked(false);
    }
  };

  const resetActivityTimer = () => {
    // Clear existing timer
    if (lockTimer) {
      clearTimeout(lockTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      lockApp();
    }, lockTimerMinutes * 60 * 1000);

    setLockTimer(timer);
  };

  const lockApp = () => {
    setIsLocked(true);
    setMnemonic(null); // Clear mnemonic from memory
    if (lockTimer) {
      clearTimeout(lockTimer);
      setLockTimer(null);
    }

    // Navigate to lock screen if not already there
    if (
      !location.pathname.startsWith("/onboarding") &&
      location.pathname !== "/lock"
    ) {
      const address = location.state?.address;
      if (address) {
        navigate("/lock", { state: { address } });
      }
    }
  };

  const unlockApp = (newMnemonic: string) => {
    setIsLocked(false);
    setMnemonic(newMnemonic);
    resetActivityTimer();
  };

  const getMnemonic = (): string | null => {
    if (isLocked) {
      return null; // Never return mnemonic when locked
    }
    return mnemonic;
  };

  const clearMnemonic = () => {
    setMnemonic(null);
  };

  const value: SecurityContextType = {
    isLocked,
    mnemonic,
    lockApp,
    unlockApp,
    getMnemonic,
    clearMnemonic,
    resetActivityTimer,
  };

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
