import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";
import {
  Home as HomeIcon,
  Send as SendIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
} from "lucide-react";
import { useSecurity } from "contexts/SecurityContext";

export const WalletNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lockApp } = useSecurity();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="flex w-full gap-1">
          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => navigate("/home")}
                className={`flex-1 h-12 border border-white transition-all duration-200 focus:outline-none focus:ring-0 ${
                  isActive("/home")
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600 border-yellow-400"
                    : "bg-gray-800 hover:bg-gray-700 hover:text-yellow-400 text-white border-white"
                }`}
              >
                <HomeIcon className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => navigate("/send")}
                className={`flex-1 h-12 border border-white transition-all duration-200 focus:outline-none focus:ring-0 ${
                  isActive("/send")
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600 border-yellow-400"
                    : "bg-gray-800 hover:bg-gray-700 hover:text-yellow-400 text-white border-white"
                }`}
              >
                <SendIcon className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Send</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => navigate("/transactions")}
                className={`flex-1 h-12 border border-white transition-all duration-200 focus:outline-none focus:ring-0 ${
                  isActive("/transactions")
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600 border-yellow-400"
                    : "bg-gray-800 hover:bg-gray-700 hover:text-yellow-400 text-white border-white"
                }`}
              >
                <ListIcon className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Transactions</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => navigate("/settings")}
                className={`flex-1 h-12 border border-white transition-all duration-200 focus:outline-none focus:ring-0 ${
                  isActive("/settings")
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600 border-yellow-400"
                    : "bg-gray-800 hover:bg-gray-700 hover:text-yellow-400 text-white border-white"
                }`}
              >
                <SettingsIcon className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={lockApp}
                className="flex-1 h-12 bg-gray-800 hover:bg-gray-700 hover:text-yellow-400 text-white border border-white transition-all duration-200 focus:outline-none focus:ring-0"
              >
                <LockIcon className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Lock</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
