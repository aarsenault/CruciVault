import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { OnboardingStepper } from "components/OnboardingStepper";
import { WalletHome } from "components/WalletHome";
import { Send } from "components/Send";
import { Transactions } from "components/Transactions";
import { Settings } from "components/Settings";
import { Lock } from "components/Lock";
import { useSecurity } from "contexts/SecurityContext";
import { storage } from "lib/storage";

export const AppRouter: React.FC = () => {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLocked } = useSecurity();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to safely update hasWallet only if changed
  const updateHasWallet = (value: boolean) => {
    setHasWallet((prev) => (prev !== value ? value : prev));
  };

  useEffect(() => {
    let walletCreatedTimeout: NodeJS.Timeout | null = null;
    let retryTimer: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    const checkWalletSetup = async () => {
      try {
        if (isUnmounted) return;
        console.log("AppRouter: Checking wallet setup...");
        setIsLoading(true);
        const stored = await storage.get(["encryptedMnemonic"]);
        console.log("AppRouter: Storage check result:", stored);
        if (!stored.encryptedMnemonic) {
          console.log("AppRouter: No wallet exists, showing onboarding");
          updateHasWallet(false);
        } else {
          console.log("AppRouter: Wallet exists, showing main app");
          updateHasWallet(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("AppRouter: Failed to check wallet setup:", error);
        updateHasWallet(false);
        setIsLoading(false);
      }
    };

    // Initial check
    checkWalletSetup();

    // Listen for wallet creation events (debounced)
    const handleWalletCreated = () => {
      if (walletCreatedTimeout) clearTimeout(walletCreatedTimeout);
      walletCreatedTimeout = setTimeout(() => {
        console.log("AppRouter: Wallet created event received, re-checking...");
        checkWalletSetup();
      }, 150); // debounce
    };

    window.addEventListener("walletCreated", handleWalletCreated);

    // Single retry after a short delay to catch any storage updates
    retryTimer = setTimeout(() => {
      console.log("AppRouter: Retrying wallet check...");
      checkWalletSetup();
    }, 1000);

    return () => {
      isUnmounted = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (walletCreatedTimeout) clearTimeout(walletCreatedTimeout);
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
        const stored = await storage.get(["encryptedMnemonic"]);
        console.log("AppRouter: Re-check result:", stored);
        if (stored.encryptedMnemonic && !hasWallet) {
          console.log(
            "AppRouter: Wallet detected after SecurityContext change, updating state"
          );
          updateHasWallet(true);
        }
      }
    };
    recheckWallet();
  }, [isLocked, isLoading, hasWallet]);

  // Only navigate to /home if wallet is unlocked and not already on /home
  useEffect(() => {
    if (
      hasWallet &&
      !isLoading &&
      !isLocked &&
      location.pathname !== "/home" &&
      (location.pathname === "/" ||
        location.pathname === "/onboarding" ||
        location.pathname.startsWith("/onboarding/"))
    ) {
      console.log(
        "AppRouter: Wallet detected and unlocked, navigating to home from:",
        location.pathname
      );
      navigate("/home", { replace: true });
    }
  }, [hasWallet, isLoading, isLocked, location.pathname, navigate]);

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
      console.log(
        "AppRouter: Rendering lock screen for path:",
        location.pathname
      );
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/lock" replace />} />
          <Route path="/lock" element={<Lock />} />
          <Route path="/index.html" element={<Navigate to="/lock" replace />} />
          <Route path="*" element={<Navigate to="/lock" replace />} />
        </Routes>
      );
    }

    // If wallet exists and is unlocked, show main app routes
    console.log(
      "AppRouter: Rendering main app routes for path:",
      location.pathname
    );
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<WalletHome />} />
        <Route path="/send" element={<Send />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lock" element={<Lock />} />
        <Route path="/index.html" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    );
  } else {
    // If no wallet exists, show onboarding
    console.log("AppRouter: Rendering onboarding for path:", location.pathname);
    return (
      <Routes>
        <Route path="/" element={<OnboardingStepper />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};
