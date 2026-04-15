import "../styles/globals.css";

export const metadata = {
  title: "AI Research Swarm",
  description: "Next.js frontend for the AI Research Swarm project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
