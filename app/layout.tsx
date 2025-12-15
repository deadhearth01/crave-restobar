import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "@/components/providers";
import { Box } from "@mui/material";

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
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: '100vh',
                overflow: 'auto',
              }}
            >
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
