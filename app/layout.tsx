import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/AuthContext";
import { CartProvider } from "@/lib/cartStore";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
   title: "PHALIS Gestão",
   description: "Sistema de gestão de pedidos",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      // 'dark' força o tema escuro do Shadcn
      <html lang="pt-BR" className="dark">
         <body className={inter.className}>
            <AuthProvider>
               <CartProvider>
                  {children}
               </CartProvider>
            </AuthProvider>
         </body>
      </html>
   );
}