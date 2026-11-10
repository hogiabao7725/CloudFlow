import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Navbar } from "@/components/common/navbar";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloudFlow: Collaborative Workspace",
  description:
    "Realtime collaborative workspace combining canvas, docs, and cloud AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#18181C",
          colorForeground: "#ededed",
          colorInput: "#09090B",
          colorInputForeground: "#ededed",
        },
      }}
    >
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
        style={{ colorScheme: "dark" }}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Toaster theme="dark" position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
