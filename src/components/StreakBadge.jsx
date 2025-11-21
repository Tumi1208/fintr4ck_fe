import React from "react";

function StarIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 8.5 22 9 17 13.5 18.5 20 12 16.5 5.5 20 7 13.5 2 9 9 8.5 12 2" />
    </svg>
  );
}

function FlameIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-4 4-8 4-8Z" />
      <path d="M12 12a2 2 0 0 0-2 2 2 2 0 0 0 4 0 4 4 0 0 0-.67-2.19" />
    </svg>
  );
}

function MedalIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.7 12.1 6 22l6-3 6 3-2.7-9.9" />
    </svg>
  );
}

function DiamondIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9Z" />
      <path d="M12 3 8 9l4 12 4-12Z" />
      <path d="m2 9 10 0 10 0" />
    </svg>
  );
}

function CrownIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 7 6l5 7 5-7 4 5-2 9H5Z" />
      <path d="M5 21h14" />
    </svg>
  );
}

function getBadge(streak) {
  if (streak >= 30) {
    return {
      label: "Royal Crown",
      color: "linear-gradient(135deg, #FFD700, #FFB300)",
      icon: CrownIcon,
      effect: "pulse",
    };
  }
  if (streak >= 20) {
    return {
      label: "Diamond Peak",
      color: "linear-gradient(90deg, #00e5ff, #7cf3ff)",
      icon: DiamondIcon,
      effect: "shine",
    };
  }
  if (streak >= 10) {
    return {
      label: "Gold Blaze",
      color: "#FFD700",
      icon: MedalIcon,
      effect: "shadow",
    };
  }
  if (streak >= 5) {
    return {
      label: "Silver Flame",
      color: "#C0C0C0",
      icon: FlameIcon,
      effect: "shine-slow",
    };
  }
  if (streak >= 1) {
    return {
      label: "Bronze Spark",
      color: "#CD7F32",
      icon: StarIcon,
      effect: "glow",
    };
  }
  return null;
}

export default function StreakBadge({ streak }) {
  const info = getBadge(streak);
  if (!info) return null;
  const Icon = info.icon;

  return (
    <>
      <style>
        {`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.6); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px 6px rgba(255, 215, 0, 0.35); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.6); }
        }
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .shine {
          background-size: 200% 100%;
          animation: shine 2s linear infinite;
        }
        .shine-slow {
          background-size: 200% 100%;
          animation: shine 3s linear infinite;
        }
        .shadow {
          box-shadow: 0 0 10px 2px rgba(255, 215, 0, 0.5), 0 0 0 2px rgba(255,255,255,0.5);
        }
        .glow {
          box-shadow: 0 0 8px 2px rgba(205, 127, 50, 0.6);
        }
        .pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}
      </style>
      <div
        className={`${info.effect ? info.effect : ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 9999,
          background: info.color,
          color: "#0B1021",
          fontWeight: 800,
          fontSize: 13,
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        <Icon size={18} color="#0B1021" />
        <span>{info.label}</span>
        <span style={{ fontWeight: 700 }}>· {streak} ngày</span>
      </div>
    </>
  );
}
