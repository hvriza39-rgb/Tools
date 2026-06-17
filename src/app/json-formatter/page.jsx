"use client";

import React, { useState, useMemo } from "react";

const COLORS = {
  bg: "#0E1116",
  card: "#161A22",
  border: "#262C38",
  ink: "#E7E9EC",
  sub: "#8B92A0",
  faint: "#6B7280",
  red: "#F26D6D",
  green: "#5EE6A8",
};

const inputStyle = {
  width: "100%",
  background: "#0B0E13",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "12px 14px",
  color: COLORS.ink,
  fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
  fontSize: 13,
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
};

export default function Page() {
  const [raw, setRaw] = useState('{\n  "hello": "world",\n  "n": 1\n}');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!raw.trim()) return { ok: null, output: "", error: "" };
    try {
      const parsed = JSON.parse(raw);
      return { ok: true, output: JSON.stringify(parsed, null, indent), error: "" };
    } catch (e) {
      return { ok: false, output: "", error: e.message };
    }
  }, [raw, indent]);

  function minify() {
    try {
      const parsed = JSON.parse(raw);
      setRaw(JSON.stringify(parsed));
    } catch {
      // leave as-is, error already shown
    }
  }

  function copy() {
    if (!result.output) return;
    navigator.clipboard?.writeText(result.output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
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
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: COLORS.faint, textTransform: "uppercase" }}>
          JSON Formatter
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 20 }}>
          Paste JSON to validate and pretty-print it.
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste JSON here"
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: COLORS.faint }}>Indent</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              style={{
                background: indent === n ? COLORS.ink : COLORS.card,
                color: indent === n ? COLORS.bg : COLORS.ink,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {n} spaces
            </button>
          ))}
          <button
            onClick={minify}
            style={{
              background: COLORS.card,
              color: COLORS.ink,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Minify input
          </button>
          <div style={{ flex: 1 }} />
          {result.ok === true && <span style={{ fontSize: 12, color: COLORS.green }}>Valid JSON</span>}
          {result.ok === false && <span style={{ fontSize: 12, color: COLORS.red }}>Invalid</span>}
        </div>

        {result.error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(242,109,109,0.08)",
              border: `1px solid rgba(242,109,109,0.3)`,
              color: COLORS.red,
              fontSize: 12,
            }}
          >
            {result.error}
          </div>
        )}

        {result.ok && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.1em", color: COLORS.faint, textTransform: "uppercase" }}>
                Formatted
              </span>
              <button
                onClick={copy}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copied ? COLORS.green : COLORS.faint,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {copied ? "copied" : "copy"}
              </button>
            </div>
            <pre
              style={{
                ...inputStyle,
                margin: 0,
                overflowX: "auto",
                maxHeight: 420,
              }}
            >
              {result.output}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
