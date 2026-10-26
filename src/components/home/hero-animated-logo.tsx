"use client";

import React, { useState, useEffect } from "react";

export function HeroAnimatedLogo() {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-5xl mx-auto select-none">
      {/* Main Vector SVG Animation Container (Scaled up for bold prominence, auto-replays every 10s) */}
      <div
        key={animationKey}
        className="w-full flex items-center justify-center overflow-x-auto py-2"
        style={{
          filter: "drop-shadow(0 0 25px rgba(255, 255, 255, 0.09)) drop-shadow(0 0 50px rgba(255, 255, 255, 0.04))",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="12 10 650 168"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl h-auto"
        >
          <defs>
            {/* Dark Monochrome & Silver Gradient (Pure White to Metallic Silver/Graphite) */}
            <linearGradient id="monochromeBrandGrad" gradientUnits="userSpaceOnUse" x1="180" y1="0" x2="650" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F4F4F5" />
              <stop offset="85%" stopColor="#D4D4D8" />
              <stop offset="100%" stopColor="#A1A1AA" />
            </linearGradient>

            {/* Tablet Bezel Metallic Gradient */}
            <linearGradient id="tabletBezel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E2E36" />
              <stop offset="100%" stopColor="#18181C" />
            </linearGradient>

            {/* Pen Barrel Gradient */}
            <linearGradient id="penBarrel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#A1A1AA" />
              <stop offset="100%" stopColor="#27272A" />
            </linearGradient>

            <style>{`
              @keyframes drawStroke {
                0% { stroke-dashoffset: 400; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes fadeIn {
                0% { opacity: 0; transform: scale(0.97); }
                100% { opacity: 1; transform: scale(1); }
              }
              @keyframes penFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
              }
              @keyframes laserPulse {
                0%, 100% { r: 3px; opacity: 0.9; filter: drop-shadow(0 0 4px #FFFFFF); }
                50% { r: 4.5px; opacity: 1; filter: drop-shadow(0 0 10px #FFFFFF); }
              }
              .anim-draw-board {
                stroke-dasharray: 600;
                stroke-dashoffset: 600;
                animation: drawStroke 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s;
              }
              .anim-fade-board {
                opacity: 0;
                animation: fadeIn 0.5s ease-out forwards 0.35s;
              }
              .anim-pen-float {
                animation: penFloat 3.5s infinite ease-in-out;
              }
              .anim-draw-pen {
                stroke-dasharray: 200;
                stroke-dashoffset: 200;
                animation: drawStroke 0.5s ease-out forwards 0.3s;
              }
              .letter-stroke {
                stroke-dasharray: 300;
                stroke-dashoffset: 300;
                animation: drawStroke 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .anim-underline {
                stroke-dasharray: 500;
                stroke-dashoffset: 500;
                animation: drawStroke 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 2.0s;
              }
              .laser-tip {
                animation: laserPulse 1.8s infinite ease-in-out;
              }
            `}</style>
          </defs>

          {/* =========================================================================
              1. ARCHITECTURAL CANVAS TABLET (Monochrome Graphite Bezel)
             ========================================================================= */}
          <g id="tabletBoard" transform="translate(18, 20)">
            {/* Outer Bezel */}
            <rect
              x="4"
              y="8"
              width="134"
              height="126"
              rx="14"
              fill="url(#tabletBezel)"
              stroke="#3F3F46"
              strokeWidth="2"
              className="anim-draw-board"
            />

            {/* Inner Matte Screen */}
            <rect
              x="12"
              y="16"
              width="118"
              height="110"
              rx="8"
              fill="#121214"
              stroke="#27272A"
              strokeWidth="1.5"
            />

            <g className="anim-fade-board">
              {/* Window Control Dots (Monochrome muted) */}
              <circle cx="22" cy="25" r="2.2" fill="#52525B" opacity="0.7" />
              <circle cx="29" cy="25" r="2.2" fill="#71717A" opacity="0.7" />
              <circle cx="36" cy="25" r="2.2" fill="#A1A1AA" opacity="0.8" />

              {/* Architecture Header Tab */}
              <rect x="46" y="22" width="42" height="6" rx="3" fill="#27272A" />

              {/* Dot Grid Blueprint Matrix inside screen */}
              <g opacity="0.3">
                <circle cx="25" cy="45" r="1.2" fill="#FFFFFF" />
                <circle cx="45" cy="45" r="1.2" fill="#FFFFFF" />
                <circle cx="65" cy="45" r="1.2" fill="#FFFFFF" />
                <circle cx="85" cy="45" r="1.2" fill="#FFFFFF" />
                <circle cx="105" cy="45" r="1.2" fill="#FFFFFF" />

                <circle cx="25" cy="70" r="1.2" fill="#FFFFFF" />
                <circle cx="45" cy="70" r="1.2" fill="#FFFFFF" />
                <circle cx="65" cy="70" r="1.2" fill="#FFFFFF" />
                <circle cx="85" cy="70" r="1.2" fill="#FFFFFF" />
                <circle cx="105" cy="70" r="1.2" fill="#FFFFFF" />

                <circle cx="25" cy="95" r="1.2" fill="#FFFFFF" />
                <circle cx="45" cy="95" r="1.2" fill="#FFFFFF" />
                <circle cx="65" cy="95" r="1.2" fill="#FFFFFF" />
                <circle cx="85" cy="95" r="1.2" fill="#FFFFFF" />
                <circle cx="105" cy="95" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Node 1: Cloud Service Icon (Clean silver) */}
              <path
                d="M 32,66 C 27,66 24,62 24,58 C 24,54 27,50 31,50 C 32,44 37,40 43,40 C 49,40 54,44 55,49 C 58,49 61,52 61,56 C 61,61 57,66 52,66 Z"
                stroke="#E4E4E7"
                strokeWidth="1.8"
                fill="rgba(255, 255, 255, 0.08)"
                strokeLinecap="round"
              />

              {/* Connection Line */}
              <path
                d="M 43,66 L 43,88 L 68,88"
                stroke="#A1A1AA"
                strokeWidth="1.8"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />

              {/* Node 2: Database Storage Cylinder */}
              <rect
                x="68"
                y="78"
                width="30"
                height="20"
                rx="4"
                stroke="#A1A1AA"
                strokeWidth="1.8"
                fill="rgba(255, 255, 255, 0.06)"
              />
              <line x1="68" y1="84" x2="98" y2="84" stroke="#71717A" strokeWidth="1.2" />
              <line x1="68" y1="91" x2="98" y2="91" stroke="#71717A" strokeWidth="1.2" />

              {/* Active Pulse Dot on Link */}
              <circle cx="55" cy="88" r="2.2" fill="#FFFFFF" className="laser-tip" />
            </g>
          </g>

          {/* =========================================================================
              2. CYBER STYLUS DRAWING PEN (Apple Pencil Minimalist Style)
             ========================================================================= */}
          <g id="stylusPen" transform="translate(136, 18)" className="anim-pen-float">
            <g transform="rotate(-36 20 80)">
              {/* Main Barrel */}
              <rect
                x="14"
                y="20"
                width="10"
                height="70"
                rx="4"
                fill="url(#penBarrel)"
                stroke="#18181B"
                strokeWidth="1"
                className="anim-draw-pen"
              />

              {/* Silver Accent Ring */}
              <rect
                x="13.5"
                y="72"
                width="11"
                height="5"
                rx="1.5"
                fill="#D4D4D8"
                stroke="#71717A"
                strokeWidth="0.8"
              />

              {/* Conical Tip */}
              <path d="M 14,90 L 19,106 L 24,90 Z" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />

              {/* Glowing Laser Nib */}
              <circle cx="19" cy="107" r="3" fill="#FFFFFF" className="laser-tip" />
            </g>
          </g>

          {/* =========================================================================
              3. MONOCHROME & GRAPHITE "CloudFlow" (Clean, Bold, Smooth Curves)
             ========================================================================= */}
          <g id="brandText" transform="translate(200, 25)">
            {/* -------------------------------------------------------------
                 WORD 1: "Cloud" (C - l - o - u - d)
               ------------------------------------------------------------- */}
            
            {/* Letter 'C' */}
            <path
              d="M 44,56 C 38,48 28,44 16,44 C -4,44 -18,60 -18,84 C -18,108 -4,124 16,124 C 28,124 38,120 44,112"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "0.65s" }}
            />

            {/* Letter 'l' (Soft gentle curve at bottom) */}
            <path
              d="M 64,44 L 64,118 C 64,122 68,124 74,124"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "0.80s" }}
            />

            {/* Letter 'o' */}
            <path
              d="M 106,72 C 92,72 82,84 82,98 C 82,112 92,124 106,124 C 120,124 130,112 130,98 C 130,84 120,72 106,72 Z"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "0.95s" }}
            />

            {/* Letter 'u' */}
            <path
              d="M 148,74 L 148,110 C 148,118 154,124 164,124 C 174,124 180,118 180,110 L 180,74"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "1.10s" }}
            />

            {/* Letter 'd' */}
            <path
              d="M 218,72 C 204,72 194,84 194,98 C 194,112 204,124 218,124 C 228,124 236,116 238,108 L 238,44"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "1.25s" }}
            />

            {/* -------------------------------------------------------------
                 WORD 2: "Flow" (F - l - o - w)
               ------------------------------------------------------------- */}

            {/* Letter 'F' */}
            <g style={{ animationDelay: "1.40s" }}>
              <path
                d="M 270,44 L 270,124"
                stroke="url(#monochromeBrandGrad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                className="letter-stroke"
                style={{ animationDelay: "1.40s" }}
              />
              <path
                d="M 270,46 L 302,46"
                stroke="url(#monochromeBrandGrad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                className="letter-stroke"
                style={{ animationDelay: "1.45s" }}
              />
              <path
                d="M 270,82 L 296,82"
                stroke="url(#monochromeBrandGrad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                className="letter-stroke"
                style={{ animationDelay: "1.50s" }}
              />
            </g>

            {/* Letter 'l' */}
            <path
              d="M 320,44 L 320,118 C 320,122 324,124 330,124"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "1.62s" }}
            />

            {/* Letter 'o' */}
            <path
              d="M 358,72 C 344,72 334,84 334,98 C 334,112 344,124 358,124 C 372,124 382,112 382,98 C 382,84 372,72 358,72 Z"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "1.75s" }}
            />

            {/* Letter 'w' */}
            <path
              d="M 396,74 L 406,122 L 420,88 L 434,122 L 444,74"
              stroke="url(#monochromeBrandGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="letter-stroke"
              style={{ animationDelay: "1.88s" }}
            />

            {/* -------------------------------------------------------------
                 AERODYNAMIC UNDERLINE (Sleek Graphite Accent)
               ------------------------------------------------------------- */}
            <path
              d="M -18,140 Q 215,146 450,138"
              stroke="#52525B"
              strokeWidth="3"
              strokeLinecap="round"
              className="anim-underline"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
