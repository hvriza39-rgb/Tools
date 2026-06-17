"use client";

import React, { useState, useEffect } from "react";

const COLORS = {
  bg: "#0E1116",
  card: "#161A22",
  border: "#262C38",
  ink: "#E7E9EC",
  sub: "#8B92A0",
  faint: "#6B7280",
  green: "#5EE6A8",
  red: "#F26D6D",
};

const inputStyle = {
  width: "100%",
  background: "#0B0E13",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "12px 14px",
  color: COLORS.ink,
  fontFamily: "inherit",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

export default function Page() {
  const [unixInput, setUnixInput] = useState("");
  const [isoInput, setIsoInput] = useState("");
  const [now, setNow] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  function fromUnix(val) {
    const n = Number(val);
    if (!val || Number.isNaN(n)) return null;
    const ms = val.length > 10 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  function fromIso(val) {
    if (!val) return null;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  const unixDate = fromUnix(unixInput);
  const isoDate = fromIso(isoInput);
  const active = unixInput ? unixDate : isoInput ? isoDate : null;

  function copy(text, key) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 1100);
  }

  function ResultRow({ label: l, value, copyKey }) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>{value}</div>
        </div>
        <button
          onClick={() => copy(value, copyKey)}
          style={{ background: "none", border: "none", color: copied === copyKey ? COLORS.green : COLORS.faint, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
        >
          {copied === copyKey ? "copied" : "copy"}
        </button>
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
          Timestamp Converter
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 8 }}>
          Convert between Unix, ISO, and readable time.
        </div>
        <div style={{ fontSize: 12, color: COLORS.faint, marginBottom: 20 }}>
          Now: {now ?? "—"} (Unix) ·{" "}
          <button
            onClick={() => now && setUnixInput(String(now))}
            style={{ background: "none", border: "none", color: COLORS.green, cursor: "pointer", fontFamily: "inherit", fontSize: 12, padding: 0 }}
          >
            use current
          </button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: COLORS.faint, marginBottom: 6 }}>Unix timestamp (seconds or ms)</div>
          <input
            value={unixInput}
            onChange={(e) => {
              setUnixInput(e.target.value);
              setIsoInput("");
            }}
            placeholder="1750000000"
            style={inputStyle}
            spellCheck={false}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.faint, marginBottom: 6 }}>ISO 8601 / date string</div>
          <input
            value={isoInput}
            onChange={(e) => {
              setIsoInput(e.target.value);
              setUnixInput("");
            }}
            placeholder="2026-06-17T12:00:00Z"
            style={inputStyle}
            spellCheck={false}
          />
        </div>

        {(unixInput && !unixDate) || (isoInput && !isoDate) ? (
          <div style={{ color: COLORS.red, fontSize: 12, marginBottom: 16 }}>Couldn't parse that value.</div>
        ) : null}

        {active && (
          <div>
            <ResultRow label="Unix (seconds)" value={String(Math.floor(active.getTime() / 1000))} copyKey="unix" />
            <ResultRow label="Unix (ms)" value={String(active.getTime())} copyKey="unixms" />
            <ResultRow label="ISO 8601" value={active.toISOString()} copyKey="iso" />
            <ResultRow label="Local" value={active.toLocaleString()} copyKey="local" />
            <ResultRow label="UTC" value={active.toUTCString()} copyKey="utc" />
          </div>
        )}
      </div>
    </main>
  );
}
