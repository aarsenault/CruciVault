import React from "react";
import { Button } from "components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayersIcon, DollarSignIcon, DownloadIcon } from "components/icons";

export const OnboardingHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full relative">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
            <LayersIcon className="text-yellow-400" />
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
            <DollarSignIcon className="mr-2" />
            Generate New Wallet
          </Button>

          <Button
            onClick={() => navigate("/onboarding/warning")}
            className="w-full border-2 border-white !border-white text-white hover:bg-white hover:text-black text-lg py-4 shadow-lg backdrop-blur-sm"
          >
            <DownloadIcon className="mr-2" />
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
