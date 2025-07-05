import React, { useState, useRef, useEffect } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";

interface ValidateStepProps {
  mnemonic: string;
  address: string;
  validateIndex?: number;
  onComplete: () => void;
  onBack: () => void;
}

export const ValidateStep: React.FC<ValidateStepProps> = ({
  mnemonic,
  address: _address,
  validateIndex: existingIndex,
  onComplete,
  onBack,
}) => {
  const [validateIndex, setValidateIndex] = useState<number | null>(
    existingIndex || null
  );
  const [validateInput, setValidateInput] = useState("");
  const [validateError, setValidateError] = useState("");
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
      // If no mnemonic, go back
      onBack();
    }
  }, [mnemonic, onBack, existingIndex]); // Only depend on existingIndex, not validateIndex

  const handleValidate = () => {
    if (!mnemonic || validateIndex === null) return;
    const words = mnemonic.split(" ");
    if (
      validateInput.trim().toLowerCase() === words[validateIndex].toLowerCase()
    ) {
      // Validation successful, proceed to next step
      onComplete();
    } else {
      setValidateError("Incorrect word. Please try again.");
    }
  };

  const handleBack = () => {
    onBack();
  };

  if (!mnemonic || validateIndex === null) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
              <span className="text-yellow-400 text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Verify Your Recovery Phrase
            </h1>
            <p className="text-gray-300 text-base">
              Please enter{" "}
              <span className="font-semibold text-yellow-400">
                word #{validateIndex + 1}
              </span>{" "}
              of your mnemonic to continue.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                className="w-full text-center bg-gray-800 text-white placeholder-gray-400 text-lg py-4"
                value={validateInput}
                onChange={(e) => setValidateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleValidate();
                }}
                placeholder={`Word #${validateIndex + 1}`}
              />
              {validateError && (
                <div className="text-red-400 text-sm text-center">
                  {validateError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-lg py-4"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button className="flex-1 text-lg py-4" onClick={handleValidate}>
                Validate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
