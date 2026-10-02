import React from 'react';

interface BuildingSkylineIllustrationProps {
  className?: string;
}

export const BuildingSkylineIllustration: React.FC<BuildingSkylineIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`w-full relative overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 460 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto object-cover transform translate-y-1"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="mainBldgFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c3848" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* --- Background Clouds & Horizon Curves (Soft Batdongsan Style) --- */}
        <g opacity="0.85">
          {/* Cloud 1 (Left & Center) */}
          <path
            d="M-20 220 V150 C-10 130 15 125 35 140 C55 110 95 105 120 135 C145 120 180 130 190 155 C210 145 240 155 250 180 C270 175 300 185 310 220 Z"
            fill="url(#cloudGrad)"
          />

          {/* Cloud 2 (Mid-Right) */}
          <path
            d="M260 220 C275 190 305 185 325 200 C345 175 385 170 410 195 C435 185 470 195 480 220 Z"
            fill="url(#cloudGrad)"
            opacity="0.6"
          />

          {/* Subtle floating cloud puff (Far right) */}
          <path
            d="M360 145 C370 138 385 138 395 145 C405 140 420 144 425 152 C430 155 430 162 422 165 C360 165 355 155 360 145 Z"
            fill="#e2e8f0"
            opacity="0.75"
          />
        </g>

        {/* --- Distant City Skyline Silhouettes --- */}
        <g opacity="0.65">
          {/* Distant Spire Building (Far Left) */}
          <rect x="15" y="145" width="22" height="75" fill="#cbd5e1" rx="1" />
          <line x1="26" y1="130" x2="26" y2="145" stroke="#94a3b8" strokeWidth="1.5" />
          
          {/* Distant Tower 2 */}
          <rect x="42" y="155" width="30" height="65" fill="#cbd5e1" rx="1" />
          <line x1="57" y1="145" x2="57" y2="155" stroke="#94a3b8" strokeWidth="1" />

          {/* Distant Sloped Roof Tower (Right behind main building) */}
          <polygon points="280,220 280,120 320,105 320,220" fill="url(#skylineGrad)" />
          {/* Mini windows on sloped tower */}
          <rect x="290" y="130" width="6" height="8" fill="#ffffff" opacity="0.8" rx="0.5" />
          <rect x="304" y="130" width="6" height="8" fill="#ffffff" opacity="0.8" rx="0.5" />
          <rect x="290" y="145" width="6" height="8" fill="#ffffff" opacity="0.8" rx="0.5" />
          <rect x="304" y="145" width="6" height="8" fill="#ffffff" opacity="0.8" rx="0.5" />
          <rect x="290" y="160" width="6" height="8" fill="#ffffff" opacity="0.8" rx="0.5" />
          <rect x="304" y="160" width="6" height="8" fill="#ffffff" opacity="0.8" rx="0.5" />

          {/* Distant Tower 4 (Far Right) */}
          <polygon points="340,220 340,135 375,135 375,220" fill="#94a3b8" opacity="0.5" />
          <polygon points="380,220 380,150 410,165 410,220" fill="#cbd5e1" opacity="0.7" />
        </g>

        {/* --- Midground Building (Light Grey/Pink Facade behind foreground building) --- */}
        <g>
          {/* Main Body */}
          <rect x="170" y="115" width="105" height="105" fill="#e2e8f0" rx="1" />
          
          {/* Roof Terrace Line */}
          <rect x="168" y="112" width="109" height="5" fill="#fca5a5" rx="1" />
          
          {/* Floor Divider Accent Bands (Salmon / Coral Pink like Image 3) */}
          <rect x="170" y="138" width="105" height="4" fill="#fca5a5" />
          <rect x="170" y="165" width="105" height="4" fill="#fca5a5" />
          <rect x="170" y="192" width="105" height="4" fill="#fca5a5" />

          {/* Windows Grid */}
          {/* Floor 4 */}
          <rect x="180" y="122" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="198" y="122" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="216" y="122" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="234" y="122" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="252" y="122" width="12" height="12" fill="#ffffff" rx="1" />

          {/* Floor 3 */}
          <rect x="180" y="148" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="198" y="148" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="216" y="148" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="234" y="148" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="252" y="148" width="12" height="12" fill="#ffffff" rx="1" />

          {/* Floor 2 */}
          <rect x="180" y="174" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="198" y="174" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="216" y="174" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="234" y="174" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="252" y="174" width="12" height="12" fill="#ffffff" rx="1" />

          {/* Floor 1 */}
          <rect x="180" y="201" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="198" y="201" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="216" y="201" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="234" y="201" width="12" height="12" fill="#ffffff" rx="1" />
          <rect x="252" y="201" width="12" height="12" fill="#ffffff" rx="1" />
        </g>

        {/* --- Foreground Modern Apartment Building (Dark Slate + Windows + Pink Roof) --- */}
        <g>
          {/* Main Dark Facade */}
          <rect x="75" y="130" width="150" height="90" fill="url(#mainBldgFade)" rx="2" />
          
          {/* Pink Roof Cornice (Exactly as in Image 3) */}
          <polygon points="70,130 95,116 230,116 225,130" fill="#ef4444" />
          <polygon points="75,130 98,118 227,118 225,130" fill="#f87171" />

          {/* Balcony / Floor Horizontal Divider Slabs */}
          <rect x="75" y="152" width="150" height="4" fill="#1e293b" />
          <rect x="75" y="175" width="150" height="4" fill="#1e293b" />
          <rect x="75" y="198" width="150" height="4" fill="#1e293b" />

          {/* Floor 3 Windows */}
          <g fill="#f8fafc">
            <rect x="90" y="136" width="10" height="11" rx="0.5" />
            <rect x="105" y="136" width="10" height="11" rx="0.5" />
            <rect x="120" y="136" width="10" height="11" rx="0.5" />
            <rect x="135" y="136" width="10" height="11" rx="0.5" />
            <rect x="150" y="136" width="10" height="11" rx="0.5" />
            <rect x="165" y="136" width="10" height="11" rx="0.5" />
            <rect x="180" y="136" width="10" height="11" rx="0.5" />
            <rect x="195" y="136" width="10" height="11" rx="0.5" />
            <rect x="210" y="136" width="5" height="11" rx="0.5" />
          </g>

          {/* Floor 2 Windows */}
          <g fill="#f8fafc">
            <rect x="90" y="159" width="10" height="11" rx="0.5" />
            <rect x="105" y="159" width="10" height="11" rx="0.5" />
            <rect x="120" y="159" width="10" height="11" rx="0.5" />
            <rect x="135" y="159" width="10" height="11" rx="0.5" />
            <rect x="150" y="159" width="10" height="11" rx="0.5" />
            <rect x="165" y="159" width="10" height="11" rx="0.5" />
            <rect x="180" y="159" width="10" height="11" rx="0.5" />
            <rect x="195" y="159" width="10" height="11" rx="0.5" />
            <rect x="210" y="159" width="5" height="11" rx="0.5" />
          </g>

          {/* Floor 1 Windows */}
          <g fill="#f8fafc">
            <rect x="90" y="182" width="10" height="11" rx="0.5" />
            <rect x="105" y="182" width="10" height="11" rx="0.5" />
            <rect x="120" y="182" width="10" height="11" rx="0.5" />
            <rect x="135" y="182" width="10" height="11" rx="0.5" />
            <rect x="150" y="182" width="10" height="11" rx="0.5" />
            <rect x="165" y="182" width="10" height="11" rx="0.5" />
            <rect x="180" y="182" width="10" height="11" rx="0.5" />
            <rect x="195" y="182" width="10" height="11" rx="0.5" />
            <rect x="210" y="182" width="5" height="11" rx="0.5" />
          </g>

          {/* Ground Floor Windows & Entrance */}
          <g fill="#e2e8f0">
            <rect x="90" y="204" width="10" height="16" rx="0.5" />
            <rect x="105" y="204" width="10" height="16" rx="0.5" />
            <rect x="120" y="204" width="10" height="16" rx="0.5" />
            <rect x="135" y="204" width="10" height="16" rx="0.5" />
            <rect x="150" y="204" width="10" height="16" rx="0.5" />
            <rect x="165" y="204" width="10" height="16" rx="0.5" />
            <rect x="180" y="204" width="10" height="16" rx="0.5" />
            <rect x="195" y="204" width="10" height="16" rx="0.5" />
          </g>
        </g>

        {/* --- Foreground Left & Right Trees / Landscaping --- */}
        <g opacity="0.85">
          {/* Left Mini Trees */}
          <circle cx="60" cy="205" r="9" fill="#94a3b8" />
          <circle cx="68" cy="202" r="11" fill="#64748b" />
          <rect x="66" y="210" width="3" height="10" fill="#475569" />

          {/* Ground Pavement Line */}
          <line x1="0" y1="219" x2="460" y2="219" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
