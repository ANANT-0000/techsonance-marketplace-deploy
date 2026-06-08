import React from 'react';

export const LoginIllustration = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 1000"
    className="h-full w-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      {/* Background Gradient */}
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A" /> {/* blue-900 */}
        <stop offset="50%" stopColor="#2563EB" /> {/* blue-600 */}
        <stop offset="100%" stopColor="#0EA5E9" /> {/* sky-500 */}
      </linearGradient>

      {/* Shield Gradient */}
      <linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
      </linearGradient>

      {/* Glow Effect */}
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Background */}
    <rect width="800" height="1000" fill="url(#bg-grad)" />

    {/* Abstract Background Elements (Shopping/Data Nodes) */}
    <g opacity="0.3">
      <circle cx="150" cy="200" r="80" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 10" />
      <circle cx="650" cy="800" r="120" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="15 15" />
      <path d="M-100 400 Q 300 200 800 500" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <path d="M0 600 Q 400 800 900 600" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
      
      {/* Floating Plus/Tech Accents */}
      <path d="M 100 800 L 120 800 M 110 790 L 110 810" stroke="#fff" strokeWidth="3" />
      <path d="M 650 150 L 670 150 M 660 140 L 660 160" stroke="#fff" strokeWidth="3" />
    </g>

    {/* Main Illustration Group */}
    <g transform="translate(400, 450)">
      {/* Central Shield */}
      <path
        d="M 0 -150 L 120 -100 L 120 50 C 120 120 60 180 0 220 C -60 180 -120 120 -120 50 L -120 -100 Z"
        fill="url(#shield-grad)"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="4"
        filter="url(#glow)"
      />
      
      {/* Inner Shield Accent */}
      <path
        d="M 0 -130 L 100 -85 L 100 45 C 100 105 50 155 0 190 C -50 155 -100 105 -100 45 L -100 -85 Z"
        fill="rgba(255, 255, 255, 0.1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
      />

      {/* Security Lock */}
      <g transform="translate(0, 20)">
        {/* Lock Body */}
        <rect x="-40" y="-20" width="80" height="60" rx="10" fill="#ffffff" />
        {/* Lock Shackle */}
        <path d="M -25 -20 V -45 C -25 -60 25 -60 25 -45 V -20" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
        {/* Keyhole */}
        <circle cx="0" cy="5" r="8" fill="#2563EB" />
        <path d="M -4 5 L -6 25 L 6 25 L 4 5 Z" fill="#2563EB" />
      </g>
      
      {/* Floating Checkmark indicating Success/Security */}
      <g transform="translate(90, 80)">
        <circle cx="0" cy="0" r="25" fill="#10B981" filter="url(#glow)" />
        <path d="M -10 0 L -2 8 L 12 -6" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  </svg>
);