"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GameProps } from "../../internal";

// Phaser를 동적으로 로드하여 SSR 문제 해결
const SuperHexagonGame = dynamic(() => import("./super-hexagon"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
      <div className="text-center flex flex-col w-full justify-center items-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-pink-500/30 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin-reverse"></div>
          <div className="absolute inset-8 w-16 h-16 border-4 border-t-purple-500 rounded-full animate-spin-reverse"></div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
          SUPER HEXAGON
        </h2>
        <p className="text-pink-300 text-lg">Loading...</p>
      </div>
    </div>
  ),
});

export default function SuperHexagonClientWrapper({ user }: GameProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-pink-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-8 w-16 h-16 border-4 border-t-purple-500 rounded-full animate-spin-reverse"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
            SUPER HEXAGON
          </h2>
          <p className="text-pink-300 text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  return <SuperHexagonGame user={user} />;
}
