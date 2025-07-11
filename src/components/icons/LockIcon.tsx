import React from "react";

interface LockIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LockIcon: React.FC<LockIconProps> = ({
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
      <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  );
};
