"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

// ---- color math -----------------------------------------------------

function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// ---- component --------------------------------------------------------

export default function Page() {
  const [hue, setHue] = useState(217); // a calm blue default
  const [sat, setSat] = useState(85);
  const [val, setVal] = useState(78);
  const [shadeIndex, setShadeIndex] = useState(50); // 0-100, 50 = base
  const [copied, setCopied] = useState(false);

  const svRef = useRef(null);
  const dragRef = useRef(null); // 'sv' | 'hue' | 'shade' | null

  const [r, g, b] = hsvToRgb(hue, sat, val);
  const baseHex = rgbToHex(r, g, b);

  // derive shade from base color's HSL, sliding lightness 5%–95%
  const [h2, s2] = rgbToHsl(r, g, b);
  const lightness = 5 + (shadeIndex / 100) * 90;
  const [sr, sg, sb] = hslToRgb(h2, s2, lightness);
  const shadeHex = rgbToHex(sr, sg, sb);

  const updateSV = useCallback((clientX, clientY) => {
    const el = svRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    setSat(Math.round((x / rect.width) * 100));
    setVal(Math.round(100 - (y / rect.height) * 100));
  }, []);

  useEffect(() => {
    function move(e) {
      if (dragRef.current === "sv") {
        const p = e.touches ? e.touches[0] : e;
        updateSV(p.clientX, p.clientY);
      }
    }
    function up() {
      dragRef.current = null;
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [updateSV]);

  function copyHex(hex) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopied(hex);
    setTimeout(() => setCopied(false), 1100);
  }

  const cursorX = sat;
  const cursorY = 100 - val;

  return (
    <div
      style={{
        minHeight: "100%",
        width: "100%",
        background: "#0E1116",
        color: "#E7E9EC",
        fontFamily:
          "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#6B7280",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          Color Picker
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#8B92A0",
            marginBottom: 20,
          }}
        >
          Pick a base color, then slide for shades.
        </div>

        {/* Saturation/Value square */}
        <div
          ref={svRef}
          onMouseDown={(e) => {
            dragRef.current = "sv";
            updateSV(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            dragRef.current = "sv";
            const p = e.touches[0];
            updateSV(p.clientX, p.clientY);
          }}
          style={{
            position: "relative",
            width: "100%",
            height: 220,
            borderRadius: 10,
            cursor: "crosshair",
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue},100%,50%))`,
            border: "1px solid #1F2430",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${cursorX}%`,
              top: `${cursorY}%`,
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.5)",
              transform: "translate(-50%, -50%)",
              background: baseHex,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Hue slider */}
        <div style={{ marginTop: 18 }}>
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            style={{
              width: "100%",
              height: 14,
              borderRadius: 7,
              outline: "none",
              WebkitAppearance: "none",
              background:
                "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
          />
        </div>

        {/* Hex / RGB readout for base color */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: baseHex,
              border: "1px solid #1F2430",
              flexShrink: 0,
            }}
          />
          <button
            onClick={() => copyHex(baseHex)}
            style={{
              flex: 1,
              background: "#161A22",
              border: "1px solid #262C38",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#E7E9EC",
              fontFamily: "inherit",
              fontSize: 15,
              letterSpacing: "0.03em",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{baseHex}</span>
            <span style={{ fontSize: 11, color: copied === baseHex ? "#5EE6A8" : "#6B7280" }}>
              {copied === baseHex ? "copied" : "copy"}
            </span>
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 6, paddingLeft: 56 }}>
          rgb({r}, {g}, {b})
        </div>

        {/* Shade variation strip */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#6B7280",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Shade
          </div>
          <div
            style={{
              position: "relative",
              height: 40,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #1F2430",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to right, ${rgbToHex(
                  ...hslToRgb(h2, s2, 5)
                )}, ${baseHex} 50%, ${rgbToHex(...hslToRgb(h2, s2, 95))})`,
              }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={shadeIndex}
            onChange={(e) => setShadeIndex(Number(e.target.value))}
            style={{
              width: "100%",
              marginTop: 10,
              height: 14,
              borderRadius: 7,
              WebkitAppearance: "none",
              outline: "none",
              background: "transparent",
            }}
            className="shade-slider"
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: shadeHex,
                border: "1px solid #1F2430",
                flexShrink: 0,
              }}
            />
            <button
              onClick={() => copyHex(shadeHex)}
              style={{
                flex: 1,
                background: "#161A22",
                border: "1px solid #262C38",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#E7E9EC",
                fontFamily: "inherit",
                fontSize: 15,
                letterSpacing: "0.03em",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{shadeHex}</span>
              <span style={{ fontSize: 11, color: copied === shadeHex ? "#5EE6A8" : "#6B7280" }}>
                {copied === shadeHex ? "copied" : "copy"}
              </span>
            </button>
          </div>
        </div>

        {/* Quick swatch row: 7 fixed steps for fast eyeballing */}
        <div style={{ display: "flex", gap: 6, marginTop: 22 }}>
          {[8, 22, 36, 50, 64, 78, 92].map((step) => {
            const l = 5 + (step / 100) * 90;
            const [qr, qg, qb] = hslToRgb(h2, s2, l);
            const hex = rgbToHex(qr, qg, qb);
            return (
              <button
                key={step}
                onClick={() => {
                  setShadeIndex(step);
                  copyHex(hex);
                }}
                title={hex}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 5,
                  background: hex,
                  border:
                    step === Math.round(shadeIndex / 14) * 14
                      ? "2px solid #E7E9EC"
                      : "1px solid #1F2430",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #0E1116;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          cursor: pointer;
          margin-top: -2px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #0E1116;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          cursor: pointer;
        }
        .shade-slider::-webkit-slider-runnable-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
