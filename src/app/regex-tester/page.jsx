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
  red: "#F26D6D",
  highlight: "rgba(94,230,168,0.25)",
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
  outline: "none",
  boxSizing: "border-box",
};

export default function Page() {
  const [pattern, setPattern] = useState("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Contact: jane@example.com or admin@apex.io for support.");

  const { regex, error } = useMemo(() => {
    try {
      return { regex: new RegExp(pattern, flags), error: null };
    } catch (e) {
      return { regex: null, error: e.message };
    }
  }, [pattern, flags]);

  const { segments, matches } = useMemo(() => {
    if (!regex || !text) return { segments: [{ text, match: false }], matches: [] };
    const allMatches = [];
    let lastIndex = 0;
    const segs = [];
    const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    let m;
    let guard = 0;
    while ((m = re.exec(text)) !== null && guard < 1000) {
      guard++;
      if (m.index > lastIndex) segs.push({ text: text.slice(lastIndex, m.index), match: false });
      segs.push({ text: m[0], match: true });
      allMatches.push(m);
      lastIndex = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (lastIndex < text.length) segs.push({ text: text.slice(lastIndex), match: false });
    return { segments: segs, matches: allMatches };
  }, [regex, text]);

  function toggleFlag(f) {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
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
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: COLORS.faint, textTransform: "uppercase" }}>
          Regex Tester
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 20 }}>
          Test a pattern against sample text.
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#0B0E13", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "0 12px" }}>
            <span style={{ color: COLORS.faint }}>/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: COLORS.ink, fontFamily: "inherit", fontSize: 13, padding: "12px 6px" }}
            />
            <span style={{ color: COLORS.faint }}>/{flags}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {["g", "i", "m", "s"].map((f) => (
            <button
              key={f}
              onClick={() => toggleFlag(f)}
              style={{
                background: flags.includes(f) ? COLORS.ink : COLORS.card,
                color: flags.includes(f) ? COLORS.bg : COLORS.faint,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "5px 11px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(242,109,109,0.08)", border: "1px solid rgba(242,109,109,0.3)", color: COLORS.red, fontSize: 12 }}>
            {error}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          spellCheck={false}
          style={{ ...inputStyle, marginBottom: 16, resize: "vertical" }}
        />

        <div style={{ fontSize: 11, color: COLORS.faint, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {matches.length} match{matches.length === 1 ? "" : "es"}
        </div>
        <div style={{ ...inputStyle, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {segments.map((s, i) =>
            s.match ? (
              <span key={i} style={{ background: COLORS.highlight, borderRadius: 3 }}>
                {s.text}
              </span>
            ) : (
              <span key={i}>{s.text}</span>
            )
          )}
        </div>

        {matches.length > 0 && matches[0].length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: COLORS.faint, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Groups (first match)
            </div>
            {matches[0].slice(1).map((g, i) => (
              <div key={i} style={{ fontSize: 12, color: COLORS.sub, marginBottom: 4 }}>
                ${i + 1}: {g ?? <span style={{ color: COLORS.faint }}>undefined</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
