import React from "react";
import { Card, CardContent } from "components/ui/card";
import { NetBackground } from "components/NetBackground";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeftIcon } from "components/icons";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showBackButton = false,
  onBack,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Check if we're in the main app (not onboarding)
  const isMainApp = !location.pathname.startsWith("/onboarding");

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden bg-gray-950"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* full‐screen net effect behind */}
      <div className="absolute inset-0 z-0">
        <NetBackground />
      </div>

      {/* Full-height layout */}
      <Card className="relative z-10 w-full min-h-screen px-0 py-0 bg-transparent border-none rounded-none shadow-none flex flex-col">
        <CardContent className="flex flex-col h-full p-0">
          {/* Header - Minimal space, background animation shows through */}
          <div className="flex items-center pt-6 px-6 pb-2">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-white hover:text-yellow-300 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeftIcon />
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">Bittensor Wallet</h1>
          </div>

          {/* Content area - Different layouts for onboarding vs main app */}
          {isMainApp ? (
            // Main app layout - Takes remaining space
            <div className="flex-1 flex flex-col">{children}</div>
          ) : (
            // Onboarding layout - Centered content
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-[90%] max-w-md backdrop-blur bg-white/10 rounded-xl p-6 shadow-lg">
                {children}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
