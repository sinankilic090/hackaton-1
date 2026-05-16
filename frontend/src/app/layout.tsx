import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Akıllı Belediye | Vatandaş Etkileşim Platformu",
  description:
    "Şikayet bildirin, anketlere katılın ve belediye hizmetlerini takip edin. Yapay zeka destekli modern belediyecilik.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
