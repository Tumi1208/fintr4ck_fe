import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Glassy select built to match Fintr4ck dashboard styling.
 * Controlled by value/onChange, options = [{ value, label }]
 */
export default function SelectField({
  options = [],
  value,
  onChange,
  placeholder = "Chọn",
  disabled = false,
  style,
  maxHeight = 260,
  dropdownWidth,
  density = "normal", // "normal" | "compact"
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton = containerRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inButton && !inDropdown) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleReposition() {
      if (open) computeDropdownRect();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const rAF = requestAnimationFrame(computeDropdownRect);
    return () => cancelAnimationFrame(rAF);
  }, [open]);

  function computeDropdownRect() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const widthValue = dropdownWidth || rect.width;
    setDropdownRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: widthValue,
    });
  }

  function handleSelect(val) {
    onChange?.(val);
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", minWidth: 180, ...style, zIndex: open ? 120 : "auto" }}
    >
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          const next = !open;
          setOpen(next);
          if (next) computeDropdownRect();
        }}
        disabled={disabled}
        style={{
          width: "100%",
          textAlign: "left",
          padding: density === "compact" ? "10px 38px 10px 12px" : "12px 42px 12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,0.3)",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(9,12,24,0.9)) padding-box," +
            "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(14,165,233,0.16)) border-box",
          color: "var(--text-strong)",
          fontWeight: 700,
          fontSize: 14,
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: open ? "0 18px 40px rgba(14,165,233,0.22)" : "0 12px 24px rgba(0,0,0,0.35)",
          outline: "none",
          position: "relative",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease",
        }}
      >
        <span style={{ opacity: selected ? 1 : 0.7 }}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: "transform 0.18s ease",
            color: "var(--text-muted)",
            fontSize: 12,
          }}
        >
          ▼
        </span>
      </button>

      {open && dropdownRect && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
                background:
                  "linear-gradient(160deg, rgba(15,23,42,0.96), rgba(10,12,22,0.94)) padding-box," +
                  "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(14,165,233,0.2)) border-box",
                border: "1px solid rgba(148,163,184,0.35)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.55)",
                borderRadius: 14,
                overflow: "hidden",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  maxHeight,
                  overflowY: "auto",
                  padding: 6,
                  scrollbarWidth: "thin",
                }}
              >
                {options.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <button
                      key={opt.value || opt.label}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid transparent",
                        background: active ? "rgba(124,58,237,0.18)" : "transparent",
                        color: "var(--text-strong)",
                        fontWeight: active ? 800 : 600,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        transition: "background 0.15s ease, transform 0.1s ease",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 18,
                          textAlign: "center",
                          color: active ? "#22d3ee" : "var(--text-muted)",
                          fontSize: 14,
                        }}
                      >
                        {active ? "✓" : "•"}
                      </span>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
