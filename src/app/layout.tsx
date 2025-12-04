import type { Metadata } from "next";
import { Fira_Code, Source_Code_Pro } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jaime Alberto Sierra Mazo - Full-Stack Developer",
  description: "Professional portfolio of Jaime Alberto Sierra Mazo, a full-stack developer specializing in Laravel, Node.js, React, Next.js, and Nuxt.js",
  keywords: "full-stack developer, Laravel, Node.js, React, Next.js, Nuxt.js, web development, Jaime Sierra Mazo",
  authors: [{ name: "Jaime Alberto Sierra Mazo" }],
  openGraph: {
    title: "Jaime Alberto Sierra Mazo - Full-Stack Developer",
    description: "Professional portfolio showcasing full-stack development projects and skills",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaime Alberto Sierra Mazo - Full-Stack Developer",
    description: "Professional portfolio showcasing full-stack development projects and skills",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${firaCode.variable} ${sourceCodePro.variable} antialiased font-mono`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}