import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/authProvider";
import { ProfileProvider } from "@/hooks/profileProvider";
import { ResumeProvider } from "@/hooks/resumeProvider";
import { PersonalInfoProvider } from "@/hooks/personalInfoProvider";
import { CheckoutProvider } from "@/hooks/CheckoutProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://resumerouter.app"),
  title: {
    default: "ResumeRouter – Tailor resumes to any job in seconds",
    template: "%s | ResumeRouter",
  },
  description:
    "ATS-ready, AI-powered resumes tailored to any job in seconds. Cleaner matches, higher interview rates.",
  keywords: [
    "AI resume",
    "ATS resume",
    "resume builder",
    "resume optimizer",
    "cover letter",
    "job description",
    "Free ai resume builder",
    "Free resume builder",
    "Free resume optimizer",
    "Free cover letter",
    "Free job description",
    "AI based resume builder",
    "AI based resume optimizer",
    "AI based cover letter",
    "AI based job description",

  

  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://resumerouter.app",
    siteName: "ResumeRouter",
    title: "ResumeRouter – Tailor resumes to any job in seconds",
    description:
      "ATS-ready, AI-powered resumes tailored to any job in seconds.",
    images: [{ url: "/opengraph.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeRouter – Tailor resumes to any job in seconds",
    description:
      "ATS-ready, AI-powered resumes tailored to any job in seconds.",
    site: "@Michael_OluDev",
    creator: "@Michael_OluDev",
    images: ["/opengraph.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
  applicationName: "ResumeRouter",
  verification: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_CODE,
  },
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
                <CheckoutProvider>
                  {children}
                </CheckoutProvider>
              </PersonalInfoProvider>
            </ResumeProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
