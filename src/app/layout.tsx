import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";
import { ContentProvider } from "@/context/ContentContext";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Content System",
  description: "Content calendar and approval system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jbMono.variable} h-full antialiased`}
    >
      <body className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
        <AuthProvider>
          <RoleProvider>
            <ContentProvider>
              {/* Sidebar */}
              <Navigation />
              
              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 lg:p-10 relative">
                <div className="max-w-7xl mx-auto w-full">
                  {children}
                </div>
              </main>
            </ContentProvider>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
