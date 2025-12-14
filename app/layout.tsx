import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Crave RestoBar - Profit Analytics",
  description: "Profit tracking and sales analytics for restaurants and bars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white min-h-screen">
        <Providers>
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-neutral-950">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
