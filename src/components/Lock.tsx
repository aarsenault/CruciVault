import React, { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useNavigate } from "react-router-dom";
import { useSecurity } from "contexts/SecurityContext";
import { decryptMnemonic } from "lib/crypto";
import { LockIcon } from "components/icons";

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
          result[key] = val ? JSON.parse(val) : undefined;
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

export const Lock: React.FC = () => {
  const navigate = useNavigate();
  const { isLocked, unlockApp } = useSecurity();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If not locked, redirect to home
    if (!isLocked) {
      navigate("/home");
    }
  }, [isLocked, navigate]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get stored encrypted mnemonic
      const stored = await getStorage().get(["encryptedMnemonic"]);

      if (!stored.encryptedMnemonic) {
        setError("No wallet found");
        return;
      }

      // Decrypt mnemonic
      const mnemonic = await decryptMnemonic(
        stored.encryptedMnemonic,
        password
      );

      // Unlock the app with the decrypted mnemonic
      unlockApp(mnemonic);

      console.log("Lock: Unlock successful, navigating to home");
      navigate("/home");
    } catch (error) {
      console.error("Lock: Unlock failed:", error);
      setError("Incorrect password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
              <LockIcon className="text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              Wallet Locked
            </h1>
            <p className="text-gray-300 text-lg drop-shadow-md">
              Enter your password to unlock your wallet
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-lg py-4"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-center text-sm drop-shadow-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-lg py-4"
              disabled={isLoading}
            >
              {isLoading ? "Unlocking..." : "Unlock Wallet"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm drop-shadow-md">
              Your wallet is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
