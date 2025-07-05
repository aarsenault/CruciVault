import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
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

export const Send: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = (location.state as LocationState) || {};

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!recipient || !amount) {
      setError("Please fill in all fields");
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement actual transaction sending
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate back to home after successful send
              navigate("/home", { state: { mnemonic: location.state?.mnemonic, address } });
    } catch (err) {
      setError("Failed to send transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    navigate("/onboarding/warning");
    return null;
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

      {/* Send Form */}
      <Card className="p-6 bg-gray-900/80 border-gray-700">
        <h2 className="text-white text-2xl font-bold mb-6">Send TAO</h2>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Recipient Address
            </label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Amount (TAO)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full"
              step="0.000000001"
              min="0"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <Button
            onClick={handleSend}
            disabled={isLoading || !recipient || !amount}
            className="w-full border-2 border-white !border-white text-lg py-3"
          >
            {isLoading ? "Sending..." : "Send TAO"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
