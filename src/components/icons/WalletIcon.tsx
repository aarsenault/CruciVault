import React from "react";

interface WalletIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const WalletIcon: React.FC<WalletIconProps> = ({
  className = "",
  width = 32,
  height = 32,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-6Z" />
    </svg>
  );
};
