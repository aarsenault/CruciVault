import React from "react";
import { Card, CardContent } from "components/ui/card";
import { NetBackground } from "components/NetBackground";
import { BackgroundOverlay } from "components/BackgroundOverlay";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeftIcon } from "components/icons";
import { WalletNavigation } from "components/WalletNavigation";

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

  // Check if we're in the main app (not onboarding or lock)
  const isOnboarding =
    location.pathname === "/" || location.pathname.startsWith("/onboarding");
  const isLockScreen = location.pathname === "/lock";
  const showNav = !isOnboarding && !isLockScreen;

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
            <div className="flex items-center gap-3">
              <img
                src="/crucivault.png"
                alt="CruciVault"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-white">CruciVault</h1>
            </div>
          </div>

          {isOnboarding ? (
            <BackgroundOverlay>
              <div className="flex-1 flex flex-col">
                <div className="w-full h-full bg-black/20">{children}</div>
              </div>
            </BackgroundOverlay>
          ) : (
            // Main app layout - Takes remaining space
            <BackgroundOverlay>
              <div className="flex flex-col flex-1">
                {showNav && (
                  <div className="px-4 pb-2 pt-2">
                    <WalletNavigation />
                  </div>
                )}
                <div className="flex-1 flex flex-col px-4 pb-6 pt-2">
                  {children}
                </div>
              </div>
            </BackgroundOverlay>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
