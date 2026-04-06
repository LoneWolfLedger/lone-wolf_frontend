export const metadata = {
  title: "LONEWOLF | Singularity",
  description: "Algorithmic Chaos Mapping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: 'black', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}