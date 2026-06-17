import Link from "next/link";

const tools = [
  {
    href: "/color-picker",
    name: "Color Picker",
    description: "Pick a hue and slide through its shades.",
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0E1116",
        color: "#E7E9EC",
        fontFamily:
          "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
        display: "flex",
        justifyContent: "center",
        padding: "48px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#6B7280",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          Tools
        </div>
        <div style={{ fontSize: 13, color: "#8B92A0", marginBottom: 24 }}>
          Small utilities, kept in one place.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              style={{
                display: "block",
                background: "#161A22",
                border: "1px solid #262C38",
                borderRadius: 8,
                padding: "14px 16px",
                textDecoration: "none",
                color: "#E7E9EC",
              }}
            >
              <div style={{ fontSize: 15, marginBottom: 4 }}>{tool.name}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                {tool.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
