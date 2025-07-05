import React, { useState } from "react";
import { Button } from "components/ui/button";
import { useNavigate } from "react-router-dom";

export const WarningStep: React.FC = () => {
  const [warnChecked, setWarnChecked] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/onboarding/generate", {
      state: {}, // Clear any existing state for fresh generation
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-white text-center">
        <span className="font-semibold text-yellow-300">Warning:</span> Anyone
        who has this mnemonic will have complete access to any funds in this
        wallet. <br />
        <span className="text-yellow-200">
          Keep it safe and never share it with anyone.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="warn"
          type="checkbox"
          checked={warnChecked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setWarnChecked(e.target.checked)
          }
          className="accent-yellow-400 w-4 h-4"
        />
        <label htmlFor="warn" className="text-white select-none">
          I understand
        </label>
      </div>
      <Button
        className="w-full border-2 border-white !border-white text-lg"
        disabled={!warnChecked}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
};
