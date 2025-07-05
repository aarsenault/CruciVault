import React, { useState } from "react";
import { Button } from "components/ui/button";
import { EyeOffIcon, EyeIcon, KeyIcon, CopyIcon } from "components/icons";

interface GenerateStepProps {
  mnemonic: string;
  address: string;
  onComplete: (mnemonic: string, address: string) => void;
  onBack: () => void;
}

export const GenerateStep: React.FC<GenerateStepProps> = ({
  mnemonic,
  address,
  onComplete,
  onBack: _onBack,
}) => {
  const [mnemonicRevealed, setMnemonicRevealed] = useState(false);
  const [showFakeText, setShowFakeText] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (!mnemonic) return;
    await navigator.clipboard.writeText(mnemonic);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const handleContinue = () => {
    if (mnemonic && address) {
      onComplete(mnemonic, address);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
              <KeyIcon className="text-yellow-400 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Your Recovery Phrase
            </h1>
            <p className="text-gray-300 text-base">
              This is your wallet recovery phrase (mnemonic).{" "}
              <a
                href="https://docs.learnbittensor.org/keys/handle-seed-phrase"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 underline transition-colors"
              >
                Keep it safe
              </a>
              .
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <div
                className={`w-full h-[160px] px-6 py-8 pb-14 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 flex items-center justify-center ${
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
                aria-label={
                  mnemonicRevealed ? "Hide mnemonic" : "Reveal mnemonic"
                }
                title={mnemonicRevealed ? "Hide mnemonic" : "Reveal mnemonic"}
              >
                {mnemonicRevealed ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-lg py-4"
                onClick={handleCopy}
                aria-label="Copy mnemonic to clipboard"
              >
                <CopyIcon className="mr-2" />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
              <Button
                className="flex-1 text-lg py-4"
                onClick={handleContinue}
                aria-label="Continue to validation"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
