import { useState, type KeyboardEvent } from "react";

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
      <svg
        className="w-64 h-64"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* frame */}
        <rect
          x="10"
          y="10"
          width="180"
          height="180"
          rx="12"
          ry="12"
          fill="#2E2E2E"
        />

        {/* door */}
        <g
          className={`transform origin-left ${
            unlocked ? "animate-open-door" : ""
          }`}
        >
          <rect
            x="10"
            y="10"
            width="180"
            height="180"
            rx="12"
            ry="12"
            fill="#444"
          />

          {/* dial */}
          <g
            className={`transform origin-center ${
              shaking ? "animate-shake" : ""
            }`}
          >
            <circle cx="100" cy="100" r="30" fill="#555" />
            <g stroke="#333" strokeWidth={2}>
              <line x1="100" y1="68" x2="100" y2="60" />
              <line x1="132" y1="100" x2="140" y2="100" />
              <line x1="100" y1="132" x2="100" y2="140" />
              <line x1="68" y1="100" x2="60" y2="100" />
            </g>
            <text
              x="100"
              y="108"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="36"
              fill="#222"
              fontWeight="bold"
            >
              T
            </text>
          </g>

          {/* handle */}
          <rect
            x="140"
            y="95"
            width="10"
            height="60"
            rx="5"
            ry="5"
            fill="#555"
          />
        </g>
      </svg>

      <input
        type="password"
        placeholder="Enter password"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={unlocked}
        className="
          mt-4 px-4 py-2 w-56 text-center text-base
          rounded-md focus:outline-none
        "
      />
    </div>
  );
};

export default VaultSplash;
