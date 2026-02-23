import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carter Wu's Blog",
  description: "Thoughts, stories and ideas by Carter Wu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${nunito.variable} antialiased`}
      >
        {children}

        {/* Footer */}
        <footer className="py-10 text-center" style={{ color: 'var(--text-muted)' }}>
          <div className="wavy-divider mb-8 max-w-md mx-auto" />
          <p className="text-sm" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            Made with warmth by Carter Wu
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent-coral)' }} />
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent-golden)' }} />
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent-sage)' }} />
          </div>
        </footer>
      </body>
    </html>
  );
}
