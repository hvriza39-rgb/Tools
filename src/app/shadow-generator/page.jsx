"use client";

import React, { useState, useMemo } from "react";

const COLORS = {
  bg: "#0E1116",
  card: "#161A22",
  border: "#262C38",
  ink: "#E7E9EC",
  sub: "#8B92A0",
  faint: "#6B7280",
  green: "#5EE6A8",
};

const row = { marginBottom: 14 };
const label = { fontSize: 12, color: COLORS.faint, marginBottom: 6, display: "flex", justifyContent: "space-between" };

export default function Page() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(8);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(35);
  const [inset, setInset] = useState(false);
  const [radius, setRadius] = useState(12);
  const [copied, setCopied] = useState(false);

  const rgba = useMemo(() => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
  }, [color, opacity]);

  const shadowValue = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
  const css = `box-shadow: ${shadowValue};`;

  function copy() {
    navigator.clipboard?.writeText(css).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  }

  function Slider({ name, value, set, min, max }) {
    return (
      <div style={row}>
        <div style={label}>
          <span>{name}</span>
          <span>{value}px</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} style={{ width: "100%" }} />
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.ink,
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: COLORS.faint, textTransform: "uppercase" }}>
          Shadow Generator
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 20 }}>
          Build a box-shadow value visually.
        </div>

        <div
          style={{
            height: 160,
            borderRadius: 12,
            background: "#1a1f29",
            border: `1px solid ${COLORS.border}`,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 80,
              borderRadius: radius,
              background: COLORS.card,
              boxShadow: shadowValue,
            }}
          />
        </div>

        <Slider name="Offset X" value={x} set={setX} min={-50} max={50} />
        <Slider name="Offset Y" value={y} set={setY} min={-50} max={50} />
        <Slider name="Blur" value={blur} set={setBlur} min={0} max={100} />
        <Slider name="Spread" value={spread} set={setSpread} min={-50} max={50} />
        <Slider name="Corner radius" value={radius} set={setRadius} min={0} max={48} />

        <div style={row}>
          <div style={label}>
            <span>Opacity</span>
            <span>{opacity}%</span>
          </div>
          <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ width: "100%" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: `1px solid ${COLORS.border}`, padding: 0, cursor: "pointer" }} />
          <label style={{ fontSize: 12, color: COLORS.sub, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
            Inset
          </label>
        </div>

        <button
          onClick={copy}
          style={{
            width: "100%",
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "12px 14px",
            color: COLORS.ink,
            fontFamily: "inherit",
            fontSize: 12,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{css}</span>
          <span style={{ color: copied ? COLORS.green : COLORS.faint, flexShrink: 0 }}>{copied ? "copied" : "copy"}</span>
        </button>
      </div>
    </main>
  );
}
