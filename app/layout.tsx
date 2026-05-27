import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VedaAI – Assessment Creator",
  description: "AI-powered assessment creator for teachers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={bricolage.variable}>
      {/* zoom baked in here (not in globals.css — Lightning CSS strips `zoom`) */}
      <body style={{ zoom: 1.25 }}>
        {children}
      </body>
    </html>
  );
}
