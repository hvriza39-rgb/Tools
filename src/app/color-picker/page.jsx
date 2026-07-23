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

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s * 100, v * 100];
}

// parse loose hex input: "f00", "#f00", "ff0000", "#FF0000"
function parseHex(input) {
  if (!input) return null;
  let s = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    s = s.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  return [r, g, b];
}

// ---- component --------------------------------------------------------

export default function Page() {
  const [hue, setHue] = useState(217); // a calm blue default
  const [sat, setSat] = useState(85);
  const [val, setVal] = useState(78);
  const [shadeIndex, setShadeIndex] = useState(50); // 0-100, 50 = base
  const [copied, setCopied] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState(false);

  const svRef = useRef(null);
  const dragRef = useRef(null); // 'sv' | 'hue' | 'shade' | null

  const [r, g, b] = hsvToRgb(hue, sat, val);
  const baseHex = rgbToHex(r, g, b);

  // derive shade from base color's HSL, sliding lightness 5%–95%
  const [h2, s2] = rgbToHsl(r, g, b);
  const lightness = 5 + (shadeIndex / 100) * 90;
  const [sr, sg, sb] = hslToRgb(h2, s2, lightness);
  const shadeHex = rgbToHex(sr, sg, sb);

  // keep the search box in sync with the base color unless the user is typing
  useEffect(() => {
    setSearchText(baseHex);
    setSearchError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseHex]);

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

  function applySearch(text) {
    const rgbVals = parseHex(text);
    if (!rgbVals) {
      setSearchError(true);
      return;
    }
    const [pr, pg, pb] = rgbVals;
    const [ph, ps, pv] = rgbToHsv(pr, pg, pb);
    setHue(Math.round(ph));
    setSat(Math.round(ps));
    setVal(Math.round(pv));
    setShadeIndex(50);
    setSearchError(false);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      applySearch(searchText);
    }
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
        padding: "48px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0.12em",
            color: "#6B7280",
            marginBottom: 6,
            textTransform: "uppercase",
          }}
        >
          Color Picker
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#8B92A0",
            marginBottom: 28,
          }}
        >
          Pick a base color, search a hex code, or slide for shades.
        </div>

        {/* Hex search */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={searchError ? "#F26D6D" : "#6B7280"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 16, pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (searchError) setSearchError(false);
              }}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => applySearch(searchText)}
              placeholder="Search hex, e.g. #3B82F6"
              spellCheck={false}
              style={{
                width: "100%",
                background: "#161A22",
                border: `1px solid ${searchError ? "#F26D6D" : "#262C38"}`,
                borderRadius: 10,
                padding: "16px 16px 16px 46px",
                color: "#E7E9EC",
                fontFamily: "inherit",
                fontSize: 18,
                letterSpacing: "0.03em",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {searchError && (
            <div style={{ fontSize: 12, color: "#F26D6D", marginTop: 8, paddingLeft: 4 }}>
              Not a valid hex code — try formats like 3B82F6 or #3B82F6
            </div>
          )}
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
            height: 380,
            borderRadius: 14,
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
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "3px solid #fff",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.5)",
              transform: "translate(-50%, -50%)",
              background: baseHex,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Hue slider */}
        <div style={{ marginTop: 24 }}>
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="main-slider"
            style={{
              width: "100%",
              height: 22,
              borderRadius: 11,
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
            gap: 16,
            marginTop: 28,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
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
              borderRadius: 10,
              padding: "16px 18px",
              color: "#E7E9EC",
              fontFamily: "inherit",
              fontSize: 20,
              letterSpacing: "0.03em",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{baseHex}</span>
            <span style={{ fontSize: 13, color: copied === baseHex ? "#5EE6A8" : "#6B7280" }}>
              {copied === baseHex ? "copied" : "copy"}
            </span>
          </button>
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 8, paddingLeft: 80 }}>
          rgb({r}, {g}, {b})
        </div>

        {/* Shade variation strip */}
        <div style={{ marginTop: 36 }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.1em",
              color: "#6B7280",
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            Shade
          </div>
          <div
            style={{
              position: "relative",
              height: 56,
              borderRadius: 10,
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
              marginTop: 14,
              height: 22,
              borderRadius: 11,
              WebkitAppearance: "none",
              outline: "none",
              background: "transparent",
            }}
            className="shade-slider main-slider"
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 18,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
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
                borderRadius: 10,
                padding: "16px 18px",
                color: "#E7E9EC",
                fontFamily: "inherit",
                fontSize: 20,
                letterSpacing: "0.03em",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{shadeHex}</span>
              <span style={{ fontSize: 13, color: copied === shadeHex ? "#5EE6A8" : "#6B7280" }}>
                {copied === shadeHex ? "copied" : "copy"}
              </span>
            </button>
          </div>
        </div>

        {/* Quick swatch row: 7 fixed steps for fast eyeballing */}
        <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
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
                  height: 40,
                  borderRadius: 7,
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
        input.main-slider[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #0E1116;
          box-shadow: 0 1px 4px rgba(0,0,0,0.5);
          cursor: pointer;
          margin-top: -3px;
        }
        input.main-slider[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #0E1116;
          box-shadow: 0 1px 4px rgba(0,0,0,0.5);
          cursor: pointer;
        }
        .shade-slider::-webkit-slider-runnable-track {
          background: transparent;
        }
        input::placeholder {
          color: #4B5160;
        }
      `}</style>
    </div>
  );
}
