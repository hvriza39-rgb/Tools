export const metadata = {
  title: "Tools",
  description: "A small collection of dev utilities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0E1116" }}>{children}</body>
    </html>
  );
}
