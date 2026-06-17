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
  fontSize: 12,
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  wordBreak: "break-all",
};

function base64UrlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const decoded = atob(s);
  try {
    // handle UTF-8
    return decodeURIComponent(
      Array.from(decoded)
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return decoded;
  }
}

export default function Page() {
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length < 2) return { error: "Not a valid JWT — expected 3 dot-separated parts." };
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return { header, payload, signature: parts[2] || "" };
    } catch (e) {
      return { error: "Couldn't decode — check the token is complete and valid base64url." };
    }
  }, [token]);

  function expiryInfo(payload) {
    if (!payload || typeof payload.exp !== "number") return null;
    const expDate = new Date(payload.exp * 1000);
    const isPast = expDate.getTime() < Date.now();
    return { expDate, isPast };
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
          JWT Decoder
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 20 }}>
          Decodes header and payload locally. Doesn't verify the signature.
        </div>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="Paste a JWT here (eyJ...)"
          style={inputStyle}
        />

        {result?.error && (
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

        {result && !result.error && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", color: COLORS.faint, marginBottom: 6, textTransform: "uppercase" }}>
                Header
              </div>
              <pre style={{ ...inputStyle, margin: 0 }}>{JSON.stringify(result.header, null, 2)}</pre>
            </div>

            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", color: COLORS.faint, marginBottom: 6, textTransform: "uppercase" }}>
                Payload
              </div>
              <pre style={{ ...inputStyle, margin: 0 }}>{JSON.stringify(result.payload, null, 2)}</pre>
              {(() => {
                const info = expiryInfo(result.payload);
                if (!info) return null;
                return (
                  <div style={{ marginTop: 8, fontSize: 12, color: info.isPast ? COLORS.red : COLORS.green }}>
                    {info.isPast ? "Expired " : "Expires "}
                    {info.expDate.toLocaleString()}
                  </div>
                );
              })()}
            </div>

            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", color: COLORS.faint, marginBottom: 6, textTransform: "uppercase" }}>
                Signature (unverified)
              </div>
              <div style={{ ...inputStyle, fontSize: 11, color: COLORS.faint }}>{result.signature || "—"}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
