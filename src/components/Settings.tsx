import React, { useState, useEffect } from "react";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSecurity } from "contexts/SecurityContext";
import { getAddressFromMnemonic } from "lib/bittensor";
import { storage } from "lib/storage";
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

interface AppSettings {
  lockTimerMinutes: number;
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { getMnemonic, clearMnemonic, isLocked, refreshSettings } =
    useSecurity();

  const [settings, setSettings] = useState<AppSettings>({
    lockTimerMinutes: 5,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  useEffect(() => {
    // If the app is locked, redirect to lock screen
    if (isLocked) {
      navigate("/lock");
      return;
    }

    const mnemonic = getMnemonic();

    if (!mnemonic) {
      // If no mnemonic and not locked, redirect to onboarding
      navigate("/onboarding/warning");
      return;
    }

    setIsAddressLoading(true);
    getAddressFromMnemonic(mnemonic)
      .then(() => {
        setIsAddressLoading(false);
      })
      .catch((error) => {
        console.error("Settings: Failed to load address:", error);
        setIsAddressLoading(false);
      });
    loadSettings();
  }, [isLocked, navigate]);

  const loadSettings = async () => {
    try {
      const stored = await storage.get(["appSettings"]);
      const appSettings = stored.appSettings as AppSettings | undefined;
      if (appSettings) {
        setSettings(appSettings);
      } else {
        // Default settings
        const defaultSettings: AppSettings = { lockTimerMinutes: 5 };
        setSettings(defaultSettings);
        await saveSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await storage.set({ appSettings: newSettings });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      // Refresh settings in SecurityContext
      await refreshSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleLockTimerChange = (value: string) => {
    const minutes = parseInt(value) || 1;
    const newSettings = {
      ...settings,
      lockTimerMinutes: Math.max(1, Math.min(60, minutes)),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // TODO - make this a hook and use elsewhere
  const handleLogOut = async () => {
    setIsLoggingOut(true);
    setShowLogoutDialog(false);
    try {
      clearMnemonic();

      await storage.set({ encryptedMnemonic: null });

      await storage.set({ walletData: null });

      navigate("/onboarding/warning", { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      navigate("/onboarding/warning", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const mnemonic = getMnemonic();

  if (!mnemonic || isAddressLoading) {
    return (
      <div className="flex flex-col gap-6 items-center">
        <div className="text-white text-center text-xl">
          Loading settings...
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="">
      <h2 className="text-white text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            Auto-lock Timer (minutes)
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={settings.lockTimerMinutes}
              onChange={(e) => handleLockTimerChange(e.target.value)}
              className="w-24"
              min="1"
              max="60"
            />
            <span className="text-gray-400 text-sm">minutes</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            The app will automatically lock after this period of inactivity
          </p>
        </div>

        {saveSuccess && (
          <div className="text-green-400 text-sm">
            Settings saved successfully!
          </div>
        )}

        {/* Log Out Section */}
        <div className="pt-6 border-t border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Account</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-3">
                Logging out will remove your wallet from this device. You'll
                need to restore it using your recovery phrase to access it
                again.
              </p>
              <Dialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
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
                        restoring it with your recovery phrase. Make sure you
                        have your recovery phrase saved securely before
                        proceeding.
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
                          • No funds will be lost - they remain on the
                          blockchain
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
    </div>
  );
};
