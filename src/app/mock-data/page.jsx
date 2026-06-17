"use client";

import React, { useState, useCallback } from "react";

const COLORS = {
  bg: "#0E1116",
  card: "#161A22",
  border: "#262C38",
  ink: "#E7E9EC",
  sub: "#8B92A0",
  faint: "#6B7280",
  green: "#5EE6A8",
};

const FIRST = ["James", "Maria", "David", "Aisha", "Liam", "Sofia", "Noah", "Chen", "Olivia", "Kwame", "Yuki", "Elena", "Marcus", "Priya", "Lucas"];
const LAST = ["Chen", "Garcia", "Smith", "Okafor", "Müller", "Tanaka", "Silva", "Kim", "Andersson", "Nguyen", "Hassan", "Petrov", "Rossi", "Kowalski"];
const DOMAINS = ["gmail.com", "outlook.com", "protonmail.com", "yahoo.com", "icloud.com"];
const TICKERS = ["BTC", "ETH", "SOL", "USDT", "AAPL", "TSLA", "EURUSD", "XAUUSD"];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randHex(len) {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function randBase58(len) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function genUser() {
  const f = rand(FIRST);
  const l = rand(LAST);
  const email = `${f.toLowerCase()}.${l.toLowerCase()}${randInt(1, 99)}@${rand(DOMAINS)}`;
  return {
    name: `${f} ${l}`,
    email,
    phone: `+1 ${randInt(200, 999)}-${randInt(200, 999)}-${randInt(1000, 9999)}`,
    kycStatus: rand(["VERIFIED", "PENDING", "NONE", "REJECTED"]),
    createdAt: new Date(Date.now() - randInt(0, 365) * 86400000).toISOString().slice(0, 10),
  };
}

function genTransaction() {
  const ticker = rand(TICKERS);
  const side = rand(["BUY", "SELL"]);
  return {
    id: "txn_" + randHex(12),
    asset: ticker,
    side,
    amount: (Math.random() * 5000 + 10).toFixed(2),
    price: (Math.random() * 60000 + 1).toFixed(2),
    status: rand(["completed", "pending", "failed"]),
    timestamp: new Date(Date.now() - randInt(0, 30) * 86400000).toISOString(),
  };
}

function genWallet() {
  return {
    eth: "0x" + randHex(40),
    btc: "bc1q" + randBase58(38),
    trc20: "T" + randBase58(33),
    sol: randBase58(44),
  };
}

const TYPES = [
  { key: "user", label: "User profile" },
  { key: "transaction", label: "Transaction" },
  { key: "wallet", label: "Wallet addresses" },
];

export default function Page() {
  const [type, setType] = useState("user");
  const [count, setCount] = useState(3);
  const [items, setItems] = useState(() => Array.from({ length: 3 }, genUser));
  const [copied, setCopied] = useState(false);

  const generators = { user: genUser, transaction: genTransaction, wallet: genWallet };

  const regenerate = useCallback((t, c) => {
    const gen = generators[t];
    setItems(Array.from({ length: c }, gen));
  }, []);

  function selectType(t) {
    setType(t);
    regenerate(t, count);
  }

  function selectCount(c) {
    setCount(c);
    regenerate(type, c);
  }

  function copy() {
    navigator.clipboard?.writeText(JSON.stringify(items, null, 2)).catch(() => {});
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
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: COLORS.faint, textTransform: "uppercase" }}>
          Mock Data Generator
        </div>
        <div style={{ fontSize: 13, color: COLORS.sub, marginBottom: 20 }}>
          Fake users, transactions, and wallet addresses for dev/testing.
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => selectType(t.key)}
              style={{
                background: type === t.key ? COLORS.ink : COLORS.card,
                color: type === t.key ? COLORS.bg : COLORS.ink,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: COLORS.faint }}>Count</span>
          {[1, 3, 5, 10].map((c) => (
            <button
              key={c}
              onClick={() => selectCount(c)}
              style={{
                background: count === c ? COLORS.ink : COLORS.card,
                color: count === c ? COLORS.bg : COLORS.ink,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {c}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => regenerate(type, count)}
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              color: COLORS.ink,
            }}
          >
            Regenerate
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.1em", color: COLORS.faint, textTransform: "uppercase" }}>
            Output
          </span>
          <button
            onClick={copy}
            style={{ background: "none", border: "none", color: copied ? COLORS.green : COLORS.faint, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >
            {copied ? "copied" : "copy JSON"}
          </button>
        </div>
        <pre
          style={{
            background: "#0B0E13",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 12,
            overflowX: "auto",
            maxHeight: 480,
            margin: 0,
          }}
        >
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
    </main>
  );
}
