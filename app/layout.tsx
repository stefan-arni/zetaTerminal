import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { FilesProvider } from "@/context/files-context";
import { WorkflowsProvider } from "@/context/workflows-context";
import { ChatProvider } from "@/context/chat-context";
import { StepperProvider } from "@/context/stepper-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeta Terminal",
  description: "AI-powered marketing operations for solopreneurs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="flex h-full flex-col overflow-hidden">
        <TooltipProvider>
          <StepperProvider>
            <FilesProvider>
              <WorkflowsProvider>
                <ChatProvider>{children}</ChatProvider>
              </WorkflowsProvider>
            </FilesProvider>
          </StepperProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
