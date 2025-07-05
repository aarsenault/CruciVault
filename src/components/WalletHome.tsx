import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Identicon } from "@polkadot/react-identicon";
import { getAddressFromMnemonic, getTaoBalance } from "lib/bittensor";
import { storage } from "lib/storage";
import { useSecurity } from "contexts/SecurityContext";
import { EditIcon, CopyIcon } from "components/icons";

interface WalletData {
  address: string;
  label: string;
  balance: string | null;
  balanceHistory: Array<{ date: string; balance: number }>;
}

export const WalletHome: React.FC = () => {
  const navigate = useNavigate();
  const { resetActivityTimer, mnemonic } = useSecurity();

  const [address, setAddress] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceFetched, setBalanceFetched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeWallet = async () => {
      // Prevent multiple initializations
      if (isInitialized) {
        console.log("WalletHome: Already initialized, skipping");
        return;
      }

      try {
        console.log("WalletHome: Starting wallet initialization...");
        setIsLoading(true);

        // Derive address from mnemonic
        if (!mnemonic) {
          console.log("WalletHome: No mnemonic available");
          navigate("/home");
          return;
        }

        console.log("WalletHome: Deriving address from mnemonic...");
        const derivedAddress = await getAddressFromMnemonic(mnemonic);
        console.log("WalletHome: Address derived:", derivedAddress);
        setAddress(derivedAddress);

        // Load wallet data
        await loadWalletData(derivedAddress);
        console.log("WalletHome: Wallet data loaded");

        resetActivityTimer();
        setIsLoading(false);
        setIsInitialized(true);
        console.log("WalletHome: Initialization complete");
      } catch (error) {
        console.error("WalletHome: Failed to initialize wallet:", error);
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, [mnemonic, resetActivityTimer, navigate]);

  // Separate useEffect for balance fetching
  useEffect(() => {
    if (address && walletData && !balanceFetched) {
      console.log("WalletHome: Starting balance fetch in separate effect");
      setBalanceFetched(true);

      // Fetch balance with delay to ensure UI is loaded
      setTimeout(() => {
        fetchBalance().catch((error) => {
          console.error("WalletHome: Failed to fetch balance:", error);
        });
      }, 1000);
    }
  }, [address, walletData, balanceFetched]);

  // Reset initialization when mnemonic changes
  useEffect(() => {
    setIsInitialized(false);
    setAddress(null);
    setWalletData(null);
    setBalanceFetched(false);
  }, [mnemonic]);

  const loadWalletData = async (walletAddress: string) => {
    try {
      console.log(
        "WalletHome: Loading wallet data for address:",
        walletAddress
      );
      const stored = await storage.get(["walletData"]);
      console.log("WalletHome: Retrieved wallet data from storage:", stored);

      const walletData = stored.walletData as
        | Record<string, WalletData>
        | undefined;
      if (walletData && walletData[walletAddress]) {
        console.log("WalletHome: Found existing wallet data");
        setWalletData(walletData[walletAddress]);
        setNewLabel(walletData[walletAddress].label || "");
      } else {
        console.log("WalletHome: No existing wallet data, creating new data");
        // Initialize new wallet data
        const newWalletData: WalletData = {
          address: walletAddress,
          label: "",
          balance: null,
          balanceHistory: [],
        };
        setWalletData(newWalletData);
        setNewLabel("");
        await saveWalletData(newWalletData);
        console.log("WalletHome: New wallet data created and saved");
      }
    } catch (error) {
      console.error("WalletHome: Failed to load wallet data:", error);
      // Set default wallet data on error
      const defaultWalletData: WalletData = {
        address: walletAddress,
        label: "",
        balance: null,
        balanceHistory: [],
      };
      setWalletData(defaultWalletData);
      setNewLabel("");
    }
  };

  const saveWalletData = async (data: WalletData) => {
    try {
      const stored = await storage.get(["walletData"]);
      const walletData =
        (stored.walletData as Record<string, WalletData>) || {};
      walletData[data.address] = data;
      await storage.set({ walletData });
    } catch (error) {
      console.error("WalletHome: Failed to save wallet data:", error);
    }
  };

  const fetchBalance = async () => {
    if (!address) {
      console.log("WalletHome: No address, skipping balance fetch");
      return;
    }

    console.log("WalletHome: Fetching balance for address:", address);

    try {
      // Add timeout to prevent hanging
      const balancePromise = getTaoBalance(address);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Balance fetch timeout")), 10000)
      );

      const balance = (await Promise.race([
        balancePromise,
        timeoutPromise,
      ])) as string;
      console.log("WalletHome: Balance fetched successfully:", balance);

      setWalletData((prev) => {
        if (!prev) {
          console.log("WalletHome: No wallet data, skipping balance update");
          return null;
        }

        const updated = { ...prev, balance };

        // Add to balance history
        const history = [...prev.balanceHistory];
        const today = new Date().toISOString().split("T")[0];
        const existingIndex = history.findIndex((h) => h.date === today);

        if (existingIndex >= 0) {
          history[existingIndex] = {
            date: today,
            balance: parseFloat(balance.replace(/,/g, "")),
          };
        } else {
          history.push({
            date: today,
            balance: parseFloat(balance.replace(/,/g, "")),
          });
        }

        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filteredHistory = history.filter(
          (h) => new Date(h.date) >= thirtyDaysAgo
        );

        updated.balanceHistory = filteredHistory;
        saveWalletData(updated);
        return updated;
      });
    } catch (error) {
      console.error("WalletHome: Failed to fetch balance:", error);
      setWalletData((prev) => {
        if (!prev) return null;
        return { ...prev, balance: "Error" };
      });
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const handleSaveLabel = async () => {
    if (!walletData) return;

    const updatedData = { ...walletData, label: newLabel };
    setWalletData(updatedData);
    setDialogOpen(false);
    await saveWalletData(updatedData);
  };

  const renderBalanceHistory = () => {
    if (!walletData?.balanceHistory || walletData.balanceHistory.length === 0) {
      return (
        <div className="text-gray-400 text-center py-8">
          No balance history available
        </div>
      );
    }

    const maxBalance = Math.max(
      ...walletData.balanceHistory.map((h) => h.balance)
    );
    const minBalance = Math.min(
      ...walletData.balanceHistory.map((h) => h.balance)
    );
    const range = maxBalance - minBalance;

    return (
      <div className="flex items-end justify-between h-48 gap-2">
        {walletData.balanceHistory.slice(-7).map((entry) => {
          const height =
            range > 0 ? ((entry.balance - minBalance) / range) * 100 : 50;
          return (
            <div key={entry.date} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-yellow-400 rounded-t transition-all duration-300 hover:bg-yellow-300"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
              <div className="text-xs text-gray-400 mt-2 text-center">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full relative z-10">
        <div className="text-white text-center text-xl drop-shadow-lg">
          Loading wallet data...
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!address || !walletData) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full relative z-10">
        <div className="text-white text-center text-xl drop-shadow-lg">
          Loading wallet data...
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-0 flex flex-col">
      <div className="flex-1 px-4 pb-4">
        <div className="h-full p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            {/* Wallet Identicon */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10">
              <Identicon value={address} size={56} theme="polkadot" />
            </div>

            {/* Wallet Label and Edit Button */}
            <div className="flex-1 flex items-center justify-between">
              <span className="text-white text-lg font-semibold">
                {walletData.label || "My Wallet"}
              </span>

              {/* Edit Wallet Details Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <EditIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Edit Wallet Details
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update your wallet label and view wallet information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">
                        Wallet Label
                      </label>
                      <Input
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Enter wallet label"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">
                        Address
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="text-white text-sm break-all flex-1 bg-gray-800 p-2 rounded">
                          {address}
                        </code>
                        <Button
                          onClick={handleCopyAddress}
                          size="sm"
                          variant="outline"
                          className="text-gray-400 hover:text-white"
                        >
                          <CopyIcon className="mr-1" />
                          {copySuccess ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveLabel} className="flex-1">
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setDialogOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-2">Address</div>
            <div className="flex items-center gap-2">
              <code className="text-white text-sm break-all flex-1">
                {address}
              </code>
              <Button
                onClick={handleCopyAddress}
                size="sm"
                variant="outline"
                className="text-gray-400 hover:text-white"
              >
                <CopyIcon className="mr-1" />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div className="mb-8">
            <div className="text-gray-400 text-sm mb-2">TAO Balance</div>
            <div className="text-white text-4xl font-bold">
              {walletData.balance === null ? "..." : walletData.balance}
            </div>
          </div>

          {/* Balance History - Takes remaining space */}
          <div className="flex-1">
            <div className="text-gray-400 text-sm mb-4">
              Balance History (7 days)
            </div>
            {renderBalanceHistory()}
          </div>
        </div>
      </div>
    </div>
  );
};
