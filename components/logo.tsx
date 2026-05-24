import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`text-primary ${className}`}
      fill="none"
    >
      {/* Rounded square background - uses current text color (text-primary by default) */}
      <rect x="10" y="10" width="180" height="180" rx="54" fill="currentColor" />
      {/* Compass needle */}
      <g transform="translate(100, 100) rotate(-45)">
        {/* Main white pointer */}
        <path d="M -40,0 C -40,-12 -20,-26 5,-26 L 65,0 L 5,26 C -20,26 -40,12 -40,0 Z" fill="#ffffff" />
        {/* Cutout triangle, matching the background color */}
        <polygon points="-22,0 2,11 2,-11" fill="currentColor" />
      </g>
    </svg>
  )
}
