import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";

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
      navigate("/home", {
        state: { mnemonic: location.state?.mnemonic, address },
      });
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
    <div className="p-6">
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
    </div>
  );
};
