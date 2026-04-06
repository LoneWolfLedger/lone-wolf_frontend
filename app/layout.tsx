import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LONEWOLF | Singularity R&D",
  description: "Algorithmic Chaos Mapping and Liquid Neural Network Testnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: 'black' }}>
        {children}
      </body>
    </html>
  );
}