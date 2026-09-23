import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export const AppLogoEmblem: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="500" height="500" rx="90" fill="#000000" />
    <g transform="translate(0, 15)">
      {/* Top White Triangle */}
      <polygon points="168,75 292,146 168,216" fill="#FFFFFF" />

      {/* Dividing White Diagonal Line */}
      <line
        x1="138"
        y1="233"
        x2="322"
        y2="131"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="square"
      />

      {/* Bottom Coral/Red Triangle */}
      <polygon points="200,208 322,141 322,282" fill="#F04E23" />
    </g>
  </svg>
);

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'YOUTUBE CHANNAL...',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-xs', sub: 'text-[8px]', gap: 'gap-2' },
    md: { box: 'w-8 h-8 sm:w-9 sm:h-9', text: 'text-sm font-black', sub: 'text-[9px]', gap: 'gap-2.5' },
    lg: { box: 'w-11 h-11', text: 'text-base font-black', sub: 'text-[10px]', gap: 'gap-3' },
    xl: { box: 'w-16 h-16', text: 'text-xl font-black', sub: 'text-xs', gap: 'gap-3.5' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* Logo Emblem Icon Badge */}
      <div
        className={`${currentSize.box} shrink-0 rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center p-0.5`}
      >
        <AppLogoEmblem className="w-full h-full object-contain" />
      </div>

      {/* Text Branding */}
      {showText && (
        <div className="flex flex-col select-none text-left">
          <span
            className={`${currentSize.text} tracking-wider text-white uppercase font-black leading-tight flex items-center gap-1.5`}
          >
            YAARO KA YAAR
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-[#FF5A36] border border-red-500/30">
              LIVE
            </span>
          </span>
          <span
            className={`${currentSize.sub} font-bold text-[#F04E23] tracking-[0.22em] uppercase leading-none mt-0.5`}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
