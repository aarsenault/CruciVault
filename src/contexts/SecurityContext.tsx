import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { storage } from "lib/storage";

interface SecurityContextType {
  isLocked: boolean;
  mnemonic: string | null;
  lockApp: () => void;
  unlockApp: (mnemonic: string) => void;
  getMnemonic: () => string | null;
  clearMnemonic: () => void;
  resetActivityTimer: () => void;
  refreshSettings: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
}) => {
  const [isLocked, setIsLocked] = useState(true); // Start locked by default
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [lockTimerMinutes, setLockTimerMinutes] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define lockApp without dependencies to prevent circular dependency
  const lockApp = useCallback(() => {
    setIsLocked(true);
    setMnemonic(null); // Clear mnemonic from memory
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Define resetActivityTimer without lockApp dependency
  const resetActivityTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!isLocked && mnemonic) {
      const timeoutMs = lockTimerMinutes * 60 * 1000;

      timerRef.current = setTimeout(() => {
        lockApp();
      }, timeoutMs);
    }
  }, [lockTimerMinutes, isLocked, mnemonic, lockApp]);

  // Debounced activity handler
  const handleActivity = useCallback(() => {
    if (isLocked) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const minTimeBetweenResets = 1000; // 1 second minimum between resets

    // Only reset if enough time has passed since last activity
    if (timeSinceLastActivity >= minTimeBetweenResets) {
      lastActivityRef.current = now;
      resetActivityTimer();
    }
  }, [isLocked, resetActivityTimer]);

  // Set up activity listeners with debouncing
  useEffect(() => {
    const events = ["mousedown", "keypress", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isLocked, handleActivity]);

  // Reset timer when lockTimerMinutes changes and app is unlocked
  useEffect(() => {
    if (!isLocked && mnemonic) {
      resetActivityTimer();
    }
  }, [lockTimerMinutes, isLocked, mnemonic, resetActivityTimer]);

  // Reset timer when app unlocks
  useEffect(() => {
    if (!isLocked && mnemonic) {
      resetActivityTimer();
    }
  }, [isLocked, mnemonic, resetActivityTimer]);

  // Load settings and check wallet state on mount
  useEffect(() => {
    loadSettings();
    checkWalletState();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await storage.get(["appSettings"]);
      const appSettings = stored.appSettings as
        | { lockTimerMinutes?: number }
        | undefined;
      if (appSettings?.lockTimerMinutes) {
        setLockTimerMinutes((prev) =>
          prev !== appSettings.lockTimerMinutes
            ? appSettings.lockTimerMinutes!
            : prev
        );
      }
    } catch (error) {
      console.error("Failed to load security settings:", error);
    }
  };

  const checkWalletState = async () => {
    try {
      const stored = await storage.get(["encryptedMnemonic"]);
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

  const unlockApp = useCallback(
    (newMnemonic: string) => {
      setIsLocked(false);
      setMnemonic(newMnemonic);
      lastActivityRef.current = Date.now(); // Set initial activity time
      resetActivityTimer();
    },
    [resetActivityTimer]
  );

  const getMnemonic = useCallback((): string | null => {
    if (isLocked) {
      return null; // Never return mnemonic when locked
    }
    return mnemonic;
  }, [isLocked, mnemonic]);

  const clearMnemonic = useCallback(() => {
    setMnemonic(null);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
      refreshSettings: loadSettings,
    }),
    [
      isLocked,
      mnemonic,
      lockApp,
      unlockApp,
      getMnemonic,
      clearMnemonic,
      resetActivityTimer,
      loadSettings,
    ]
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
