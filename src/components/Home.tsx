import React, { useState, useEffect } from "react";
import { OnboardingHome } from "./OnboardingHome";
import { WalletHome } from "./WalletHome";

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

export const Home: React.FC = () => {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWalletSetup = async () => {
      try {
        console.log("Home: Checking wallet setup...");
        setIsLoading(true);

        // Check if user has completed onboarding by looking for encrypted mnemonic
        const stored = await getStorage().get(["encryptedMnemonic"]);
        console.log("Home: Storage check result:", stored);

        if (!stored.encryptedMnemonic) {
          console.log("Home: No wallet exists");
          setHasWallet(false);
        } else {
          console.log("Home: Wallet exists");
          setHasWallet(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Home: Failed to check wallet setup:", error);
        setHasWallet(false);
        setIsLoading(false);
      }
    };

    checkWalletSetup();
  }, []);

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

  // Show appropriate component based on wallet existence
  if (hasWallet) {
    return <WalletHome />;
  } else {
    return <OnboardingHome />;
  }
};
