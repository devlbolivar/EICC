import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Provider from "@/provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "EICC - Plataforma de Aprendizaje",
  description: "Sistema de gestión de aprendizaje empresarial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>
          <Provider>{children}</Provider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
