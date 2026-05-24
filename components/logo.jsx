export function Logo({ className = '', size = 40 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`text-primary ${className}`}
      fill="none"
    >
      <rect x="10" y="10" width="180" height="180" rx="54" fill="currentColor" />
      <g transform="translate(100, 100) rotate(-45)">
        <path d="M -40,0 C -40,-12 -20,-26 5,-26 L 65,0 L 5,26 C -20,26 -40,12 -40,0 Z" fill="#ffffff" />
        <polygon points="-22,0 2,11 2,-11" fill="currentColor" />
      </g>
    </svg>
  )
}
