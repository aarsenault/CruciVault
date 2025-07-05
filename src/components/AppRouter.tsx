import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { OnboardingStepper } from "components/OnboardingStepper";
import { WalletHome } from "components/WalletHome";
import { Send } from "components/Send";
import { Transactions } from "components/Transactions";
import { Settings } from "components/Settings";
import { Lock } from "components/Lock";
import { useSecurity } from "contexts/SecurityContext";

declare global {
  interface Window {
    chrome?: {
      storage?: {
        sync?: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          get: (keys: string[], cb: (result: any) => void) => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Promise<any>((resolve) =>
          window.chrome!.storage!.sync!.get(keys, resolve)
        ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: (data: any) =>
        new Promise<void>((resolve) =>
          window.chrome!.storage!.sync!.set(data, resolve)
        ),
    };
  } else {
    // Fallback for dev: use localStorage
    return {
      get: async (keys: string[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: async (data: any) => {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      },
    };
  }
};

export const AppRouter: React.FC = () => {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLocked } = useSecurity();
  const navigate = useNavigate();

  useEffect(() => {
    const checkWalletSetup = async () => {
      try {
        console.log("AppRouter: Checking wallet setup...");
        setIsLoading(true);

        // Check if user has completed onboarding by looking for encrypted mnemonic
        const stored = await getStorage().get(["encryptedMnemonic"]);
        console.log("AppRouter: Storage check result:", stored);

        if (!stored.encryptedMnemonic) {
          console.log("AppRouter: No wallet exists, showing onboarding");
          setHasWallet(false);
        } else {
          console.log("AppRouter: Wallet exists, showing main app");
          setHasWallet(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("AppRouter: Failed to check wallet setup:", error);
        setHasWallet(false);
        setIsLoading(false);
      }
    };

    // Initial check
    checkWalletSetup();

    // Listen for wallet creation events
    const handleWalletCreated = () => {
      console.log("AppRouter: Wallet created event received, re-checking...");
      // Add a small delay to ensure storage is updated
      setTimeout(() => {
        checkWalletSetup();
      }, 200);

      // Additional retry attempts to ensure wallet is detected
      setTimeout(() => {
        console.log("AppRouter: Second retry after wallet creation...");
        checkWalletSetup();
      }, 500);

      setTimeout(() => {
        console.log("AppRouter: Third retry after wallet creation...");
        checkWalletSetup();
      }, 1000);
    };

    window.addEventListener("walletCreated", handleWalletCreated);

    // Retry check after a short delay to catch any storage updates
    const retryTimer = setTimeout(() => {
      console.log("AppRouter: Retrying wallet check...");
      checkWalletSetup();
    }, 1000);

    return () => {
      clearTimeout(retryTimer);
      window.removeEventListener("walletCreated", handleWalletCreated);
    };
  }, []);

  // Add a debug effect to log current state
  useEffect(() => {
    console.log(
      "AppRouter: Current state - hasWallet:",
      hasWallet,
      "isLoading:",
      isLoading,
      "isLocked:",
      isLocked
    );
  }, [hasWallet, isLoading, isLocked]);

  // Re-check wallet when SecurityContext state changes
  useEffect(() => {
    const recheckWallet = async () => {
      if (!isLoading) {
        console.log(
          "AppRouter: SecurityContext state changed, re-checking wallet..."
        );
        const stored = await getStorage().get(["encryptedMnemonic"]);
        console.log("AppRouter: Re-check result:", stored);

        if (stored.encryptedMnemonic && !hasWallet) {
          console.log(
            "AppRouter: Wallet detected after SecurityContext change, updating state"
          );
          setHasWallet(true);
        }
      }
    };

    recheckWallet();
  }, [isLocked, isLoading, hasWallet]);

  // Navigate to home when wallet is detected and not locked
  useEffect(() => {
    if (hasWallet && !isLoading && !isLocked) {
      console.log("AppRouter: Wallet detected and unlocked, navigating to home");
      navigate("/home", { replace: true });
    }
  }, [hasWallet, isLoading, isLocked, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full relative">
        {/* Blurred background overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

        <div className="flex flex-col gap-6 items-center justify-center h-full relative z-10">
          <div className="text-white text-center text-xl drop-shadow-lg">
            Loading...
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Show appropriate routes based on wallet existence and lock state
  if (hasWallet) {
    // If wallet exists but is locked, show lock screen
    if (isLocked) {
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/lock" replace />} />
          <Route path="/lock" element={<Lock />} />
          <Route path="*" element={<Navigate to="/lock" replace />} />
        </Routes>
      );
    }

    // If wallet exists and is unlocked, show main app routes
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<WalletHome />} />
        <Route path="/send" element={<Send />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lock" element={<Lock />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    );
  } else {
    // If no wallet exists, show onboarding
    return (
      <Routes>
        <Route path="/" element={<OnboardingStepper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};
