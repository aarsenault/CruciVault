import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const OnboardingHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full relative">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-400"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to Tao Wallet
          </h1>
          <p className="text-gray-300 text-lg mb-8 drop-shadow-md">
            Securely manage your Bittensor wallet. Choose an option to get
            started.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <Button
            onClick={() => navigate("/onboarding/warning")}
            className="w-full border-2 border-yellow-400 !border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-lg py-4 shadow-lg backdrop-blur-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Generate New Wallet
          </Button>

          <Button
            onClick={() => navigate("/onboarding/warning")}
            className="w-full border-2 border-white !border-white text-white hover:bg-white hover:text-black text-lg py-4 shadow-lg backdrop-blur-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import Existing Wallet
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm drop-shadow-md">
            Your wallet data is stored locally and encrypted for security.
          </p>
        </div>
      </div>
    </div>
  );
};
