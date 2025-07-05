import { useState, type KeyboardEvent } from "react";
import { VaultIcon } from "components/icons";

export const VaultSplash: React.FC = () => {
  const [shaking, setShaking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleChange = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setUnlocked(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <VaultIcon className="w-64 h-64" unlocked={unlocked} shaking={shaking} />

      <input
        type="password"
        placeholder="Enter password"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={unlocked}
        className="
          mt-4 px-4 py-2 w-56 text-center text-base
          rounded-md focus:outline-none
          bg-gray-800 text-white placeholder-gray-400
          border border-gray-600 focus:border-yellow-400
        "
      />
    </div>
  );
};

export default VaultSplash;
