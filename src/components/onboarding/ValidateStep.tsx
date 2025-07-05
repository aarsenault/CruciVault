import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { useSecurity } from "../../contexts/SecurityContext";
import { encryptMnemonic } from "../../lib/crypto";

interface LocationState {
  mnemonic: string;
  address: string;
  validateIndex?: number;
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

export const ValidateStep: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unlockApp } = useSecurity();
  const {
    mnemonic,
    address,
    validateIndex: existingIndex,
  } = (location.state as LocationState) || {};

  const [validateIndex, setValidateIndex] = useState<number | null>(
    existingIndex || null
  );
  const [validateInput, setValidateInput] = useState("");
  const [validateError, setValidateError] = useState("");
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mnemonic) {
      // Only generate new index if we don't have one from state
      if (validateIndex === null && existingIndex === undefined) {
        const words = mnemonic.split(" ");
        const idx = Math.floor(Math.random() * words.length);
        setValidateIndex(idx);
      } else if (existingIndex !== undefined) {
        // Use the existing index from state
        setValidateIndex(existingIndex);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // If no mnemonic in state, redirect to start
      navigate("/onboarding/warning");
    }
  }, [mnemonic, navigate, existingIndex]); // Only depend on existingIndex, not validateIndex

  const handleValidate = async () => {
    if (!mnemonic || validateIndex === null) return;
    const words = mnemonic.split(" ");
    if (
      validateInput.trim().toLowerCase() === words[validateIndex].toLowerCase()
    ) {
      // Show password setup
      setShowPasswordSetup(true);
    } else {
      setValidateError("Incorrect word. Please try again.");
    }
  };

  const handlePasswordSetup = async () => {
    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    try {
      console.log("Validation successful, starting wallet setup...");

      // Encrypt and store mnemonic
      console.log("Encrypting and storing mnemonic...");
      const encryptedMnemonic = await encryptMnemonic(mnemonic, password);
      await getStorage().set({ encryptedMnemonic });
      console.log("Mnemonic encrypted and stored successfully");

      // Unlock the app with the mnemonic
      console.log("Unlocking app...");
      unlockApp(mnemonic);
      console.log("App unlocked");

      // Navigate to home (Home component will route to WalletHome)
      console.log("Navigating to home...");
      navigate("/home");
      console.log("Navigation complete");
    } catch (error) {
      console.error("Failed to complete wallet setup:", error);
      setPasswordError("Failed to complete setup. Please try again.");
    }
  };

  const handleBack = () => {
    if (showPasswordSetup) {
      setShowPasswordSetup(false);
      setPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } else {
      navigate("/onboarding/generate", {
        state: { mnemonic, address, validateIndex },
      });
    }
  };

  if (!mnemonic || validateIndex === null) {
    return null;
  }

  if (showPasswordSetup) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <div className="text-white text-center mb-2">
          Set up a password to secure your wallet
        </div>
        <Input
          type="password"
          className="w-full text-center"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password (min 8 characters)"
        />
        <Input
          type="password"
          className="w-full text-center"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
        />
        {passwordError && (
          <div className="text-red-400 text-sm">{passwordError}</div>
        )}
        <Button
          className="w-full border-2 border-white !border-white text-lg"
          onClick={handlePasswordSetup}
        >
          Create Wallet
        </Button>
        <Button
          className="w-full border-2 border-white !border-white text-lg"
          onClick={handleBack}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="text-white text-center mb-2">
        Please enter{" "}
        <span className="font-semibold text-yellow-300">
          word #{validateIndex + 1}
        </span>{" "}
        of your mnemonic to continue.
      </div>
      <Input
        ref={inputRef}
        className="w-full text-center"
        value={validateInput}
        onChange={(e) => setValidateInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleValidate();
        }}
        placeholder={`Word #${validateIndex + 1}`}
      />
      {validateError && (
        <div className="text-red-400 text-sm">{validateError}</div>
      )}
      <Button
        className="w-full border-2 border-white !border-white text-lg"
        onClick={handleValidate}
      >
        Validate
      </Button>
      <Button
        className="w-full border-2 border-white !border-white text-lg"
        onClick={handleBack}
      >
        Back
      </Button>
    </div>
  );
};
