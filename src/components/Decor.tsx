/**
 * مجموعه‌ی SVG‌های تزئینی برای پس‌زمینه‌ی بخش‌های مختلف.
 * همه‌ی آن‌ها pointer-events:none و در لایه‌ی پشت محتوا قرار می‌گیرند.
 */

export function BlobField({ className = "" }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 -z-10 overflow-hidden " + className}>
      <svg className="absolute -top-24 right-0 h-96 w-96 text-teal-300/30 blur-2xl animate-float-slow" viewBox="0 0 200 200" fill="currentColor">
        <path d="M44.7,-76.4C58.9,-69.3,71.8,-59.2,79.6,-45.9C87.4,-32.6,90.1,-16.3,87.8,-1.3C85.5,13.7,78.2,27.4,69.2,39.8C60.2,52.2,49.5,63.3,36.9,71.3C24.3,79.3,9.8,84.2,-4.6,89.8C-19,95.4,-33.4,101.7,-46.2,97.3C-59,92.9,-70.2,77.8,-77.3,62.2C-84.4,46.6,-87.4,30.5,-87.2,15C-87,-0.5,-83.6,-15.4,-76.4,-28.2C-69.2,-41,-58.2,-51.7,-46,-59.2C-33.8,-66.7,-20.4,-71,-6.2,-75.3C8,-79.6,16,-83.9,27,-83.6C38,-83.3,30.5,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute bottom-0 left-0 h-80 w-80 text-sky-300/30 blur-2xl animate-float-med" viewBox="0 0 200 200" fill="currentColor">
        <path d="M37.5,-62.1C48.9,-55.3,58.1,-44.6,64.7,-32.5C71.3,-20.4,75.3,-6.9,73.9,6.1C72.5,19.1,65.7,31.6,56.3,42.1C46.9,52.6,34.9,61.1,21.6,66.6C8.3,72.1,-6.3,74.6,-20.4,72.1C-34.5,69.6,-48,62.1,-58.3,51.1C-68.6,40.1,-75.7,25.6,-77.9,10.4C-80.1,-4.8,-77.4,-20.7,-70.1,-34.3C-62.8,-47.9,-50.9,-59.2,-37.6,-65.3C-24.3,-71.4,-9.7,-72.3,3.1,-69.6C15.9,-66.9,26.1,-68.9,37.5,-62.1Z" transform="translate(100 100)" />
      </svg>
    </div>
  );
}

export function DotGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={"pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.5] " + className} aria-hidden="true">
      <defs>
        <pattern id="dots" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#0f766e" opacity="0.18" />
        </pattern>
        <radialGradient id="dotmask" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#000" stopOpacity="1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask id="dotmaskref">
          <rect width="100%" height="100%" fill="url(#dotmask)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" mask="url(#dotmaskref)" />
    </svg>
  );
}

export function GridLines({ className = "" }: { className?: string }) {
  return (
    <svg className={"pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40 " + className} aria-hidden="true">
      <defs>
        <pattern id="grid" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M44 0H0V44" fill="none" stroke="#0f766e" strokeOpacity="0.12" strokeWidth="1" />
        </pattern>
        <radialGradient id="gridmask" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#000" stopOpacity="1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask id="gridmaskref">
          <rect width="100%" height="100%" fill="url(#gridmask)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridmaskref)" />
    </svg>
  );
}

export function WaveDivider({ color = "#0f766e", className = "" }: { color?: string; className?: string }) {
  return (
    <svg className={"pointer-events-none -z-10 " + className} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path fill={color} fillOpacity="0.08" d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L0,120Z" />
      <path fill={color} fillOpacity="0.12" d="M0,96L80,90.7C160,85,320,75,480,69.3C640,64,800,64,960,69.3C1120,75,1280,85,1360,90.7L1440,96L1440,120L0,120Z" />
    </svg>
  );
}

export function FloatingShapes({ className = "" }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 -z-10 overflow-hidden " + className}>
      <svg className="absolute right-[12%] top-[18%] h-16 w-16 text-teal-400/30 animate-float-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M3 9h18M9 3v18" opacity="0.6" />
      </svg>
      <svg className="absolute left-[8%] top-[60%] h-12 w-12 text-sky-400/30 animate-float-med" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
      </svg>
      <svg className="absolute right-[20%] bottom-[14%] h-14 w-14 text-orange-400/30 animate-float-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" opacity="0.6" />
      </svg>
      <svg className="absolute left-[18%] top-[24%] h-10 w-10 text-teal-400/30 animate-float-med" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2v20M2 12h20" />
        <path d="M5 5l14 14M19 5L5 19" opacity="0.5" />
      </svg>
    </div>
  );
}

export function CircuitLines({ className = "" }: { className?: string }) {
  return (
    <svg className={"pointer-events-none absolute inset-0 -z-10 h-full w-full " + className} viewBox="0 0 1200 400" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="circuitgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <g stroke="url(#circuitgrad)" strokeWidth="1.2">
        <path d="M0,80 H300 V200 H600 V120 H900 V260 H1200" />
        <path d="M0,300 H250 V180 H500 V320 H820 V220 H1200" opacity="0.7" />
        <circle cx="300" cy="200" r="4" fill="#0f766e" fillOpacity="0.3" />
        <circle cx="600" cy="120" r="4" fill="#0ea5e9" fillOpacity="0.3" />
        <circle cx="820" cy="320" r="4" fill="#0f766e" fillOpacity="0.3" />
        <circle cx="900" cy="260" r="4" fill="#f97316" fillOpacity="0.3" />
      </g>
    </svg>
  );
}
