"use client";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Header from "./_components/Header";
import Main from "./_components/Main";
import Footer from "./_components/Footer";
export default function Home() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
}
