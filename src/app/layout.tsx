import type { Metadata } from "next";
import { Poppins, Yellowtail } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "framer-motion";
import { Nav } from "@/components/Nav";
import { CinematicFooter } from "@/components/ui/CinematicFooter";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CalProvider } from "@/components/booking/CalProvider";
import { ThemeProvider } from "@/components/theme/ThemeContext";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/JsonLd";
import { site, siteUrl } from "@/lib/site";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("sublime-theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const yellowtail = Yellowtail({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    url: "/",
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${yellowtail.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <JsonLd schema={organizationSchema} />
        <JsonLd schema={websiteSchema} />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <CalProvider>
              <ScrollProgress />
              <Nav />
              <main className="flex-1">{children}</main>
              <CinematicFooter />
            </CalProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
