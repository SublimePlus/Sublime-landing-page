import type { Metadata } from "next";
import { Poppins, Yellowtail } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BookingModalProvider } from "@/components/booking/BookingModalContext";
import { ThemeProvider } from "@/components/theme/ThemeContext";

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
  title: "Sublime+ | Content & social marketing, done with a little extra",
  description:
    "Sublime+ writes, posts, and manages content and social for brands who'd rather be doing anything else. Creative, reliable, social-savvy.",
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
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <BookingModalProvider>
            <ScrollProgress />
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </BookingModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
