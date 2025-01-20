"use client";

import { RotateCw } from "lucide-react";

interface SaveButtonProps {
  onClick: () => void;
}

export default function Refresh({ onClick }: SaveButtonProps) {
  return (
    <div className="fixed top-5 left-5">
      <button
        className="text-white  bg-black transition-all duration-300 hover:scale-110 active:scale-90 p-4 rounded-full shadow-md  shadow-cyan-400"
        aria-label="Share"
        onClick={() => {
          onClick();
        }}
      >
        <RotateCw className="text-white w-6 h-6" />
      </button>
    </div>
  );
}
