import React, { useState } from "react";
import { Button } from "components/ui/button";

interface WarningStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const WarningStep: React.FC<WarningStepProps> = ({
  onContinue,
  onBack: _onBack,
}) => {
  const [warnChecked, setWarnChecked] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
              <span className="text-yellow-400 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Security Warning
            </h1>
            <p className="text-gray-300 text-base">
              Anyone who has this mnemonic will have complete access to any funds in this wallet.
            </p>
            <p className="text-yellow-400 text-base mt-2">
              Keep it safe and never share it with anyone.
            </p>
          </div>

          <div className="space-y-6">
            <div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer"
              onClick={() => {
                console.log("Checkbox container clicked, current value:", warnChecked);
                setWarnChecked(!warnChecked);
              }}
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                warnChecked
                  ? 'bg-yellow-400 border-yellow-400'
                  : 'border-gray-400'
              }`}>
                {warnChecked && (
                  <span className="text-black text-sm font-bold">✓</span>
                )}
              </div>
              <span className="text-white text-base select-none flex-1">
                I understand the risks and will keep my mnemonic secure
              </span>
            </div>

            <Button
              className="w-full text-lg py-4"
              disabled={!warnChecked}
              onClick={() => {
                console.log("Continue button clicked, warnChecked:", warnChecked);
                onContinue();
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
