import React from "react";
import { Button } from "components/ui/button";
import { LayersIcon, DollarSignIcon, DownloadIcon } from "components/icons";

interface OnboardingHomeProps {
  onGenerateWallet: () => void;
  onImportWallet: () => void;
}

export const OnboardingHome: React.FC<OnboardingHomeProps> = ({
  onGenerateWallet,
  onImportWallet,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
              <LayersIcon className="text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Welcome to Tao Wallet
            </h1>
            <p className="text-gray-300 text-base">
              Securely manage your Bittensor wallet. Choose an option to get
              started.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={onGenerateWallet} className="w-full text-lg py-4">
              <DollarSignIcon className="mr-2" />
              Generate New Wallet
            </Button>

            <Button
              onClick={onImportWallet}
              variant="outline"
              className="w-full text-lg py-4"
            >
              <DownloadIcon className="mr-2" />
              Import Existing Wallet
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Your wallet data is stored locally and encrypted for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
