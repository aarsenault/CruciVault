import React, { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { generateWallet } from "lib/bittensor";
import { EyeOffIcon, EyeIcon } from "components/icons";

interface LocationState {
  mnemonic: string;
  address: string;
  validateIndex?: number;
}

export const GenerateStep: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mnemonic: existingMnemonic, address: existingAddress } =
    (location.state as LocationState) || {};

  const [mnemonic, setMnemonic] = useState<string | null>(
    existingMnemonic || null
  );
  const [address, setAddress] = useState<string | null>(
    existingAddress || null
  );
  const [mnemonicRevealed, setMnemonicRevealed] = useState(false);
  const [showFakeText, setShowFakeText] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(!existingMnemonic);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingMnemonic) {
      // If we have existing data, don't generate new wallet
      return;
    }

    const generateWalletData = async () => {
      try {
        const wallet = await generateWallet();
        setMnemonic(wallet.mnemonic);
        setAddress(wallet.address);
        setIsGenerating(false);
      } catch (err) {
        console.error("Failed to generate wallet:", err);
        setError("Failed to generate wallet. Please try again.");
        setIsGenerating(false);
      }
    };

    generateWalletData();
  }, [existingMnemonic]);

  const handleCopy = async () => {
    if (!mnemonic) return;
    await navigator.clipboard.writeText(mnemonic);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const handleContinue = () => {
    if (mnemonic) {
      // Preserve the validation index if it exists in state
      const state: any = { mnemonic, address };
      if (location.state?.validateIndex !== undefined) {
        state.validateIndex = location.state.validateIndex;
      }
      navigate("/onboarding/validate", { state });
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col gap-6 items-center">
        <div className="text-white text-center text-xl">
          Generating your wallet...
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <div className="text-red-400 text-center text-lg">{error}</div>
        <Button
          className="w-full border-2 border-white !border-white text-lg"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!mnemonic) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="text-white text-center mb-4 text-xl">
        This is your wallet recovery phrase (mnemonic).{" "}
        <a
          href="https://docs.learnbittensor.org/keys/handle-seed-phrase"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-300 hover:text-yellow-400 underline transition-colors"
        >
          Keep it safe
        </a>
        .
      </div>
      <div className="relative w-full flex justify-center">
        <div
          className={`w-full h-[160px] px-6 py-8 pb-14 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-700 flex items-center justify-center ${
            mnemonicRevealed ? "backdrop-blur-0" : "backdrop-blur-md"
          }`}
          style={{
            filter: mnemonicRevealed ? "none" : "blur(12px)",
            transition: "filter 0.3s ease-in-out",
          }}
        >
          <span
            className={`text-lg tracking-wider text-center select-all font-mono whitespace-pre-wrap ${
              mnemonicRevealed ? "text-white" : "text-gray-400"
            }`}
            style={{
              userSelect: mnemonicRevealed ? "all" : "none",
              minHeight: "1.5rem",
              lineHeight: "1.5rem",
              paddingBottom: "2.5rem",
            }}
          >
            {mnemonicRevealed || !showFakeText
              ? mnemonic
              : "random words not real seedphrase\nbecause viewing via inspect element\nremains possible"}
          </span>
        </div>
        <Button
          className="absolute right-3 bottom-3 p-2 border border-white/50 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
          onClick={() => {
            if (mnemonicRevealed) {
              // When hiding: start blur animation, then show fake text after 300ms
              setMnemonicRevealed(false);
              setTimeout(() => {
                setShowFakeText(true);
              }, 300);
            } else {
              // When revealing: show real text immediately, then deblur
              setShowFakeText(false);
              setMnemonicRevealed(true);
            }
          }}
          aria-label={mnemonicRevealed ? "Hide mnemonic" : "Reveal mnemonic"}
          title={mnemonicRevealed ? "Hide mnemonic" : "Reveal mnemonic"}
        >
          {mnemonicRevealed ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      </div>
      <div className="flex gap-3 w-full">
        <Button
          className="flex-1 border-2 border-white !border-white text-lg py-3"
          onClick={handleCopy}
          aria-label="Copy mnemonic to clipboard"
        >
          {copySuccess ? "Copied!" : "Copy"}
        </Button>
        <Button
          className="flex-1 border-2 border-white !border-white text-lg py-3"
          onClick={handleContinue}
          aria-label="Continue to validation"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
