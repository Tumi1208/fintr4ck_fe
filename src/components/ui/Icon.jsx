import { useId } from "react";

const palettes = {
  brand: ["#8b5cf6", "#0ea5e9"],
  green: ["#34d399", "#10b981"],
  amber: ["#fcd34d", "#fb923c"],
  red: ["#f87171", "#ef4444"],
  blue: ["#60a5fa", "#38bdf8"],
  slate: ["#cbd5e1", "#94a3b8"],
};

const glyphs = {
  check: ({ stroke }) => (
    <>
      <circle cx="12" cy="12" r="7.6" strokeOpacity="0.6" />
      <path d="M8.2 12.4 11.1 15l5-5.2" strokeWidth="1.9" />
    </>
  ),
  play: ({ fill }) => (
    <path d="M10 8.6 16 12l-6 3.4Z" fill={fill} stroke="none" />
  ),
  arrowLeft: ({ stroke }) => (
    <>
      <path d="M14.8 7.7 9.5 12l5.3 4.3" />
      <path d="M10.8 12h4.7" strokeOpacity="0.8" />
    </>
  ),
  arrowUp: ({ stroke }) => (
    <>
      <path d="M12 7.5v8.5" />
      <path d="M8.6 11 12 7.5 15.4 11" />
    </>
  ),
  arrowUpRight: ({ stroke }) => (
    <>
      <path d="M9 15.5 15.5 9" />
      <path d="M11.2 9h4.3v4.3" strokeOpacity="0.85" />
    </>
  ),
  arrowDown: () => (
    <>
      <path d="M12 8.5v7" />
      <path d="M8.8 12.7 12 15.5l3.2-2.8" />
    </>
  ),
  refresh: () => (
    <>
      <path d="M8.6 9V6.8H6.4" />
      <path d="M6.6 12.4a5.4 5.4 0 0 1 9.2-3.8l1.4 1.2" />
      <path d="M15.4 15v2.2h2.2" />
      <path d="M17.4 11.6a5.4 5.4 0 0 1-9.2 3.8l-1.4-1.2" />
    </>
  ),
  search: () => (
    <>
      <circle cx="11" cy="11" r="4.7" />
      <path d="m14.4 14.4 3.2 3.2" />
    </>
  ),
  close: () => (
    <>
      <path d="m8.5 8.5 7 7" />
      <path d="m15.5 8.5-7 7" />
    </>
  ),
  inbox: () => (
    <>
      <path d="M6.5 7.5h11l1 5v4a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-4Z" />
      <path d="M6.8 12.5h3.4l1 1.5h3.6l1-1.5h3.4" />
    </>
  ),
  wallet: () => (
    <>
      <path d="M5.2 9.3h11.4a2.4 2.4 0 0 1 2.4 2.4v1.6a2.4 2.4 0 0 1-2.4 2.4H5.2A2.2 2.2 0 0 1 3 13.6v-.8a3.5 3.5 0 0 1 2.2-3.5Z" />
      <path d="M16.2 11.4h-2a1.1 1.1 0 1 0 0 2.2h2a1.1 1.1 0 1 0 0-2.2Z" />
      <path d="M16.5 9V8.3A1.8 1.8 0 0 0 14.7 6.5H8.7" strokeOpacity="0.7" />
    </>
  ),
  chart: () => (
    <>
      <path d="M6.5 15.5 10 12l2.3 1.9L17.5 9" />
      <path d="M16.8 9H13V7.2" strokeOpacity="0.85" />
      <path d="M11 18h-4a1 1 0 0 1-1-1v-4" strokeOpacity="0.5" />
    </>
  ),
  book: () => (
    <>
      <path d="M7.3 6.8h5.5A2.2 2.2 0 0 1 15 9v8.7H8.3A2.3 2.3 0 0 1 6 15.4V9a2.2 2.2 0 0 1 1.3-2.2Z" />
      <path d="M15 9.5c0-1.5 1.1-2.7 2.5-2.7H18a1.7 1.7 0 0 1 1.7 1.7v9a1.7 1.7 0 0 1-1.7 1.7H15" strokeOpacity="0.7" />
      <path d="M9.2 9.9h4" />
    </>
  ),
  home: () => (
    <>
      <path d="M7 10.8 12 6.7l5 4.1V17a1 1 0 0 1-1 1h-3v-3.2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1V18H8A1 1 0 0 1 7 17v-6.2Z" />
      <path d="m9 10 3-2.7L14.8 10" strokeOpacity="0.7" />
    </>
  ),
  bag: () => (
    <>
      <path d="M7.4 10h9.2l-.7 6.2a1.6 1.6 0 0 1-1.6 1.4H9.7a1.6 1.6 0 0 1-1.6-1.4Z" />
      <path d="M9.3 10V8.5a2.7 2.7 0 1 1 5.4 0V10" strokeOpacity="0.75" />
    </>
  ),
  award: () => (
    <>
      <circle cx="12" cy="10" r="3.5" />
      <path d="m9.5 12.3-.9 5.7L12 16l3.4 2-1-5.7" />
    </>
  ),
  article: () => (
    <>
      <rect x="7.5" y="6.8" width="9" height="11" rx="2" />
      <path d="M10 9.8h4.8" />
      <path d="M10 12.8h3.5" strokeOpacity="0.85" />
      <path d="M10 15.8h4.2" strokeOpacity="0.65" />
    </>
  ),
  tool: () => (
    <>
      <path d="M14.6 6.8a3.6 3.6 0 0 1-.3 4.8l-4.2 4.2a1.7 1.7 0 0 1-2.4 0 1.7 1.7 0 0 1 0-2.4l4.2-4.2a3.6 3.6 0 0 1 4.7-.4Z" />
      <path d="m13.1 8.3 2.5 2.5" strokeOpacity="0.8" />
      <path d="m15.7 14 2.1 2.1" strokeOpacity="0.8" />
      <circle cx="17.8" cy="16.1" r=".6" fill="currentColor" />
    </>
  ),
  edit: () => (
    <>
      <path d="m14.9 7.2 1.9 1.9-6.9 6.9H8V15Z" />
      <path d="M13.7 8.5 15 7.2" strokeOpacity="0.85" />
    </>
  ),
  trash: () => (
    <>
      <path d="M9.5 10v5.5" />
      <path d="M12 10v5.5" strokeOpacity="0.8" />
      <path d="M14.5 10v5.5" />
      <path d="M6.8 10h10.4" />
      <path d="M9.2 8h5.6" strokeOpacity="0.65" />
      <path d="M10.2 6.8h3.6" strokeOpacity="0.5" />
      <path d="M8 10v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7" />
    </>
  ),
  link: ({ stroke }) => (
    <>
      <path d="M9 15.5 15.5 9" />
      <path d="M12 9h3.5V12.5" strokeOpacity="0.9" />
      <path d="M9 12h-2A1.5 1.5 0 0 0 5.5 13.5v1A1.5 1.5 0 0 0 7 16h1.8" strokeOpacity="0.6" />
    </>
  ),
  spark: ({ stroke }) => (
    <path d="m12 6.5 1.1 3.1a1 1 0 0 0 .6.6l3.1 1.1-3.1 1.1a1 1 0 0 0-.6.6L12 16.5l-1.1-3.1a1 1 0 0 0-.6-.6l-3.1-1.1 3.1-1.1a1 1 0 0 0 .6-.6Z" />
  ),
  dashboard: () => (
    <>
      <rect x="6.5" y="6.5" width="4.5" height="11" rx="1.1" />
      <rect x="12.9" y="10" width="4.6" height="7.5" rx="1.1" />
      <path d="M12.9 8.9h4.6" />
      <path d="M11 8.9H6.5" strokeOpacity="0.8" />
    </>
  ),
  receipt: () => (
    <>
      <rect x="8" y="6.5" width="8" height="11" rx="1.4" />
      <path d="M10.4 9.5h5.2" />
      <path d="M10.4 12h4.2" strokeOpacity="0.8" />
      <path d="M10.4 14.5h5" strokeOpacity="0.6" />
      <path d="M8 17.5 6.8 18l-.3-.5-.3.5-.4-.2-.3.5-.4-.2-.3.4-.4-.2" strokeOpacity="0.65" />
    </>
  ),
  puzzle: () => (
    <>
      <path d="M10.2 7.2a1.3 1.3 0 1 1 2.6 0V8h1.1a1.3 1.3 0 1 1 0 2.6h-.4v2.8h.4a1.3 1.3 0 1 1 0 2.6h-1.1v.8a1.3 1.3 0 1 1-2.6 0v-.4H9.2a1.3 1.3 0 1 1 0-2.6h.4v-2.8h-.4a1.3 1.3 0 1 1 0-2.6h1.1Z" />
    </>
  ),
  flag: () => (
    <>
      <path d="M7.8 6.5v11" />
      <path d="M8 7l2.4.7a2 2 0 0 0 1.1 0l3.7-1.1v6.4l-3.7 1.1a2 2 0 0 1-1.1 0L8 13.4" />
    </>
  ),
  checkBadge: () => (
    <>
      <path d="m9 9.6 2.1 1.8 3.6-3.6" />
      <path d="M8 11.6a4 4 0 0 1 8 0v2.3a2.1 2.1 0 0 1-1.2 1.9l-2.3 1a1.4 1.4 0 0 1-1 0l-2.3-1A2.1 2.1 0 0 1 8 14Z" />
    </>
  ),
  clipboard: () => (
    <>
      <rect x="8" y="8" width="8" height="9.5" rx="1.4" />
      <path d="M10.2 8.7v-.9a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v.9" />
      <path d="M10.5 11.2h5" strokeOpacity="0.85" />
      <path d="M10.5 13.6h4.2" strokeOpacity="0.65" />
    </>
  ),
  bookmark: ({ stroke, fill }) => (
    <>
      <path d="M9 6.7h6a1.3 1.3 0 0 1 1.3 1.3v10l-4.3-2.6a1.2 1.2 0 0 0-1.2 0L7.5 18V8a1.3 1.3 0 0 1 1.3-1.3Z" />
      <path d="m10.5 9.4 1.5 1 1.5-1" stroke={fill} strokeWidth="1.4" />
    </>
  ),
  gear: () => (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="m9.4 5.8.4 1a1 1 0 0 1-.3 1.2L8.5 8.8a1 1 0 0 0 0 1.4l.5.5-1 1.8 1.3.8a1 1 0 0 1 .4 1.2l-.4 1 2 .6.6-.8a1 1 0 0 1 1.2-.3l1 .4.8-2-.8-.6a1 1 0 0 1-.3-1.2l.4-1-1.8-.6-.7 1a1 1 0 0 1-1.2.2l-1-.4" strokeOpacity="0.8" />
    </>
  ),
};

export default function Icon({ name, size = 20, tone = "brand", background = true }) {
  const id = useId();
  const glyph = glyphs[name] || glyphs.spark;
  const [from, to] = palettes[tone] || palettes.brand;
  const gradientId = `${id}-grad`;
  const stroke = `url(#${gradientId})`;
  const fill = stroke;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      style={{ flexShrink: 0, color: to }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      {background && (
        <rect
          x="2.4"
          y="2.4"
          width="19.2"
          height="19.2"
          rx="7.6"
          fill={stroke}
          opacity="0.12"
        />
      )}
      <g
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyph({ stroke, fill })}
      </g>
    </svg>
  );
}
