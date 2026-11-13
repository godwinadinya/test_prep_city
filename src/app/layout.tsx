import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { Toast } from "@/components/ui";
import "./globals.css";
import { GlobalLoadingBar } from "@/components/global-loading-bar";

export const metadata: Metadata = {
  title: "Test Prep City — Score your target. See the proof.",
  description:
    "JAMB UTME preparation for Nigerian candidates: video lessons, question banks, full CBT mocks, analytics and rewards.",
  manifest: "/manifest.webmanifest",
  applicationName: "Test Prep City",
};

export const viewport: Viewport = {
  themeColor: "#000080",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('tpc-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-bold focus:text-navy-900"
        >
          Skip to main content
        </a>
          <GlobalLoadingBar />

        <StoreProvider>
          {children}
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
