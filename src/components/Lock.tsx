import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useSecurity } from "contexts/SecurityContext";
import { decryptMnemonic } from "lib/crypto";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import {
  LogOut as LogOutIcon,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";

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
  const { unlockApp, clearMnemonic } = useSecurity();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

      console.log("Lock: Unlock successful");
    } catch (error) {
      console.error("Lock: Unlock failed:", error);
      setError("Incorrect password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    setShowLogoutDialog(false);
    try {
      // Clear mnemonic from memory
      clearMnemonic();

      // Remove encrypted mnemonic from storage
      await getStorage().set({ encryptedMnemonic: null });

      // Remove wallet data from storage
      await getStorage().set({ walletData: null });

      // Navigate to onboarding
      navigate("/onboarding/warning", { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      // Even if storage clear fails, still navigate to onboarding
      navigate("/onboarding/warning", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 backdrop-blur-md"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700 overflow-hidden">
              <img
                src="/crucivault.png"
                alt="CruciVault"
                className="w-12 h-12 object-contain"
              />
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
                className="w-full text-lg py-4 bg-gray-800 text-white placeholder-gray-400"
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

          {/* Log Out Section */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                      <AlertTriangleIcon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-white text-xl">
                        Confirm Log Out
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        This action cannot be undone
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4" />
                      Recovery Phrase Required
                    </h4>
                    <p className="text-gray-300 text-sm">
                      After logging out, you will{" "}
                      <strong>only be able to access this wallet</strong> by
                      restoring it with your recovery phrase. Make sure you have
                      your recovery phrase saved securely before proceeding.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">
                      What happens when you log out:
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>
                        • Your wallet will be completely removed from this
                        device
                      </li>
                      <li>• All wallet data will be deleted from storage</li>
                      <li>
                        • You'll need your recovery phrase to restore access
                      </li>
                      <li>
                        • No funds will be lost - they remain on the blockchain
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowLogoutDialog(false)}
                      className="flex-1 bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogOut}
                      disabled={isLoggingOut}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Logging Out...
                        </>
                      ) : (
                        <>
                          <LogOutIcon className="w-4 h-4 mr-2" />
                          Yes, Log Out
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};
