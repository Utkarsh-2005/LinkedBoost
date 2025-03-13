// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import Navbar from "./components/NavBar";
import { CreditsProvider } from "@/app/contexts/CreditsContext";

export const metadata: Metadata = {
  title: "LinkedBoost",
  description: "Evaluate your LinkedIn profile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <CreditsProvider>
          <body>
            <Navbar />
            {children}
          </body>
        </CreditsProvider>
      </SessionProvider>
    </html>
  );
}
