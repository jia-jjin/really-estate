
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Topbar from "@/components/navbar";
import { Chat } from "@/components/chat/chat";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "reallyEstate",
  description: "One app for all your housing needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white relative`}>
        <Topbar />
        <Chat/>
        <ToastContainer />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
