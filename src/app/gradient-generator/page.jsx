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

export default function Page() {
  const [colorA, setColorA] = useState("#1E3A5F");
  const [colorB, setColorB] = useState("#5EE6A8");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState("linear");
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => {
    if (type === "linear") {
      return `linear-gradient(${angle}deg, ${colorA}, ${colorB})`;
    }
    return `radial-gradient(circle, ${colorA}, ${colorB})`;
  }, [colorA, colorB, angle, type]);

  function copy() {
    navigator.clipboard?.writeText(`background: ${css};`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  }

  const swatchInput = {
    width: 44,
    height: 44,
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    background: "none",
    padding: 0,
    cursor: "pointer",
  };

  const textInput = {
    flex: 1,
    background: "#0B0E13",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: COLORS.ink,
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
  };

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
          Gradient Generator
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 20 }}>
          Pick two colors, get a CSS gradient.
        </div>

        <div
          style={{
            height: 160,
            borderRadius: 12,
            background: css,
            border: `1px solid ${COLORS.border}`,
            marginBottom: 20,
          }}
        />

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["linear", "radial"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1,
                background: type === t ? COLORS.ink : COLORS.card,
                color: type === t ? COLORS.bg : COLORS.ink,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "8px 0",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} style={swatchInput} />
          <input
            type="text"
            value={colorA}
            onChange={(e) => setColorA(e.target.value)}
            style={textInput}
            spellCheck={false}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} style={swatchInput} />
          <input
            type="text"
            value={colorB}
            onChange={(e) => setColorB(e.target.value)}
            style={textInput}
            spellCheck={false}
          />
        </div>

        {type === "linear" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.faint, marginBottom: 8 }}>Angle: {angle}°</div>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        )}

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
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>background: {css};</span>
          <span style={{ color: copied ? COLORS.green : COLORS.faint }}>{copied ? "copied" : "copy"}</span>
        </button>
      </div>
    </main>
  );
}
