"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundLayer = () => {
  return (
    <div className="background-layer fixed inset-0 w-[100vw] h-[100vh] -z-10 pointer-events-none overflow-hidden bg-[#070707]">
      {/* Deep Shadow Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,15,15,0)_0%,rgba(7,7,7,1)_100%)]"></div>
      
      {/* Signature Aetheria Gold Curves */}
      <div className="absolute left-1/2 bottom-[-40vh] transform -translate-x-1/2 w-[180vw] h-[120vh]">
        {/* The Glow Core */}
        <div 
          className="absolute inset-x-0 bottom-0 h-full w-full opacity-40"
          style={{
            background: "radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0) 70%)"
          }}
        ></div>
        
        {/* Layered High-Fidelity Lines */}
        <div className="absolute inset-x-0 bottom-[10vh] h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent blur-[1px]"></div>
        <div className="absolute inset-x-0 bottom-[10.5vh] h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-[11vh] h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent blur-[3px]"></div>
      </div>

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};
