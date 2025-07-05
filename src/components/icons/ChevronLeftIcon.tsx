import React from "react";

interface ChevronLeftIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({
  className = "",
  width = 20,
  height = 20,
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
};
