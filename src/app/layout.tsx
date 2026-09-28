import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "María Bonita Beauty Salon & Japanese Head Spa",
  description: "María Bonita Beauty Salon & Head Spa. Experiencia exclusiva de belleza, cabello, uñas y santuario de bienestar japonés.",
};

import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.prod.website-files.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.prod.website-files.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${poppins.variable} ${montserrat.variable}`}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8V3X5Q8QKG"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8V3X5Q8QKG');
          `}
        </Script>
      </body>
    </html>
  );
}

