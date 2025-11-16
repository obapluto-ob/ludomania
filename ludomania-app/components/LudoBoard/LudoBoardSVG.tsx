'use client';

/**
 * Professional SVG-based Ludo Board
 * Looks exactly like Ludo King/Star with vibrant colors
 */
export default function LudoBoardSVG() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Board Background - Wooden texture */}
      <rect width="600" height="600" fill="#8B4513" />
      
      {/* Main Board - White cross shape */}
      <rect x="0" y="240" width="600" height="120" fill="#FFFFFF" />
      <rect x="240" y="0" width="120" height="600" fill="#FFFFFF" />
      
      {/* RED HOME ZONE (Bottom-Left) */}
      <rect x="0" y="360" width="240" height="240" fill="#EF4444" />
      <circle cx="80" cy="440" r="30" fill="#FFFFFF" stroke="#DC2626" strokeWidth="4" />
      <circle cx="160" cy="440" r="30" fill="#FFFFFF" stroke="#DC2626" strokeWidth="4" />
      <circle cx="80" cy="520" r="30" fill="#FFFFFF" stroke="#DC2626" strokeWidth="4" />
      <circle cx="160" cy="520" r="30" fill="#FFFFFF" stroke="#DC2626" strokeWidth="4" />
      
      {/* BLUE HOME ZONE (Top-Left) */}
      <rect x="0" y="0" width="240" height="240" fill="#3B82F6" />
      <circle cx="80" cy="80" r="30" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
      <circle cx="160" cy="80" r="30" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
      <circle cx="80" cy="160" r="30" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
      <circle cx="160" cy="160" r="30" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
      
      {/* GREEN HOME ZONE (Top-Right) */}
      <rect x="360" y="0" width="240" height="240" fill="#22C55E" />
      <circle cx="440" cy="80" r="30" fill="#FFFFFF" stroke="#16A34A" strokeWidth="4" />
      <circle cx="520" cy="80" r="30" fill="#FFFFFF" stroke="#16A34A" strokeWidth="4" />
      <circle cx="440" cy="160" r="30" fill="#FFFFFF" stroke="#16A34A" strokeWidth="4" />
      <circle cx="520" cy="160" r="30" fill="#FFFFFF" stroke="#16A34A" strokeWidth="4" />
      
      {/* YELLOW HOME ZONE (Bottom-Right) */}
      <rect x="360" y="360" width="240" height="240" fill="#FACC15" />
      <circle cx="440" cy="440" r="30" fill="#FFFFFF" stroke="#EAB308" strokeWidth="4" />
      <circle cx="520" cy="440" r="30" fill="#FFFFFF" stroke="#EAB308" strokeWidth="4" />
      <circle cx="440" cy="520" r="30" fill="#FFFFFF" stroke="#EAB308" strokeWidth="4" />
      <circle cx="520" cy="520" r="30" fill="#FFFFFF" stroke="#EAB308" strokeWidth="4" />
      
      {/* CENTER TRIANGLE */}
      <polygon
        points="300,240 360,300 300,360 240,300"
        fill="#FBBF24"
        stroke="#FFFFFF"
        strokeWidth="4"
      />
      
      {/* PATH SQUARES - Complete Ludo path (52 squares) */}
      {/* This is simplified - we'll create a proper path component */}
      {/* For now, showing the cross-shaped path */}
      
      {/* FINISH LANES */}
      {/* Red finish lane */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={`red-finish-${i}`}
          x={40 + i * 40}
          y={300}
          width={40}
          height={40}
          fill="#FCA5A5"
          stroke="#1F2937"
          strokeWidth="2"
        />
      ))}
      
      {/* Blue finish lane */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={`blue-finish-${i}`}
          x={260}
          y={40 + i * 40}
          width={40}
          height={40}
          fill="#93C5FD"
          stroke="#1F2937"
          strokeWidth="2"
        />
      ))}
      
      {/* Green finish lane */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={`green-finish-${i}`}
          x={520 - i * 40}
          y={260}
          width={40}
          height={40}
          fill="#86EFAC"
          stroke="#1F2937"
          strokeWidth="2"
        />
      ))}
      
      {/* Yellow finish lane */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={`yellow-finish-${i}`}
          x={300}
          y={520 - i * 40}
          width={40}
          height={40}
          fill="#FDE047"
          stroke="#1F2937"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

