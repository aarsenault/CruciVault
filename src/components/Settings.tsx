import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import {
  Home as HomeIcon,
  Send as SendIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
} from "lucide-react";

interface LocationState {
  mnemonic: string;
  address: string;
}

interface AppSettings {
  lockTimerMinutes: number;
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

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = (location.state as LocationState) || {};

  const [settings, setSettings] = useState<AppSettings>({
    lockTimerMinutes: 5,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!address) {
      navigate("/onboarding/warning");
      return;
    }

    loadSettings();
  }, [address, navigate]);

  const loadSettings = async () => {
    try {
      const stored = await getStorage().get(["appSettings"]);
      if (stored.appSettings) {
        setSettings(stored.appSettings);
      } else {
        // Default settings
        const defaultSettings: AppSettings = { lockTimerMinutes: 5 };
        setSettings(defaultSettings);
        await saveSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await getStorage().set({ appSettings: newSettings });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
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

  if (!address) {
    navigate("/onboarding/warning");
    return null;
  }

  if (isLoading) {
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
    <div className="flex flex-col gap-6">
      {/* Navigation Menu */}
      <div className="p-4 pb-2">
        <NavigationMenu className="w-full">
          <NavigationMenuList className="w-full justify-between">
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={() =>
                  navigate("/home", {
                    state: { mnemonic: location.state?.mnemonic, address },
                  })
                }
              >
                <span className="flex items-center gap-1">
                  <HomeIcon className="w-4 h-4" /> Home
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={() =>
                  navigate("/send", {
                    state: { mnemonic: location.state?.mnemonic, address },
                  })
                }
              >
                <span className="flex items-center gap-1">
                  <SendIcon className="w-4 h-4" /> Send
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={() =>
                  navigate("/transactions", {
                    state: { mnemonic: location.state?.mnemonic, address },
                  })
                }
              >
                <span className="flex items-center gap-1">
                  <ListIcon className="w-4 h-4" /> Transactions
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={() =>
                  navigate("/settings", {
                    state: { mnemonic: location.state?.mnemonic, address },
                  })
                }
              >
                <span className="flex items-center gap-1">
                  <SettingsIcon className="w-4 h-4" /> Settings
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={() =>
                  navigate("/lock", {
                    state: { mnemonic: location.state?.mnemonic, address },
                  })
                }
              >
                <span className="flex items-center gap-1">
                  <LockIcon className="w-4 h-4" /> Lock
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Settings Form */}
      <Card className="p-6 bg-gray-900/80 border-gray-700">
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
        </div>
      </Card>
    </div>
  );
};
