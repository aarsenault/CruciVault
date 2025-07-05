import React from "react";

interface BackgroundOverlayProps {
  children: React.ReactNode;
  className?: string;
}

export const BackgroundOverlay: React.FC<BackgroundOverlayProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex flex-col h-full relative ${className}`}>
      {/* Dim background overlay - always present to prevent flashing */}
      <div className="absolute inset-0 bg-black/82"></div>

      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
};
