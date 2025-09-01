import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authProvider";
import { ProfileProvider } from "@/context/profileProvider";
import { ResumeProvider } from "@/context/resumeProvider";
import { PersonalInfoProvider } from "@/context/personalInfoProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeRouter - Tailor Your Resume. Land the Right Job.",
  description: "Map your skills to roles, auto-tailor your resume, and get a learning path — all powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white mt-0 scroll-smooth sticky top-0 ">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <AuthProvider>
          <ProfileProvider>
            <ResumeProvider>
              <PersonalInfoProvider>
              {children}
              </PersonalInfoProvider>
            </ResumeProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
