"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else {
        // Hide header when scrolling down
        setIsVisible(false);
      }

      setIsScrolled(currentScrollY > 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const burgerButton = document.getElementById("burger-button");

      if (
        mobileMenu &&
        !mobileMenu.contains(event.target as Node) &&
        burgerButton &&
        !burgerButton.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false); // Close mobile menu after clicking a link
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 sm:px-10 py-4 bg-white shadow-sm z-50 transition-all duration-300 ${
          isScrolled ? "shadow-md" : ""
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="flex items-center gap-3 text-gray-800">
          <Image
            src="/logo-minimalista.png"
            alt="EICCC Logo"
            className="h-10 rounded-md cursor-pointer"
            onClick={() => scrollToSection("inicio")}
            width={40}
            height={40}
          />
          <h2
            onClick={() => scrollToSection("inicio")}
            className="text-gray-800 text-2xl font-bold leading-tight tracking-[-0.015em] cursor-pointer"
          >
            EICCC
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("programas")}
            className="text-gray-700 hover:text-[#1978e5] text-sm font-medium leading-normal transition-colors cursor-pointer"
          >
            Programas
          </button>

          <button
            onClick={() => scrollToSection("certificaciones")}
            className="text-gray-700 hover:text-[#1978e5] text-sm font-medium leading-normal transition-colors cursor-pointer"
          >
            Certificaciones
          </button>

          <button
            onClick={() => scrollToSection("testimonios")}
            className="text-gray-700 hover:text-[#1978e5] text-sm font-medium leading-normal transition-colors cursor-pointer"
          >
            Testimonios
          </button>
        </nav>
        <div className="flex items-center gap-5">
          <Link
            href="/workspace"
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1978e5] hover:bg-blue-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Aula virtual</span>
          </Link>
          <Link
            href="/workspace"
            className="hidden sm:flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1978e5]  hover:bg-blue-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Iniciar Sesión</span>
          </Link>
          <button
            id="burger-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <nav className="flex flex-col gap-6">
            <button
              onClick={() => scrollToSection("programas")}
              className="text-gray-700 hover:text-[#1978e5] text-base font-medium leading-normal transition-colors text-left"
            >
              Programas
            </button>
            <button
              onClick={() => scrollToSection("certificaciones")}
              className="text-gray-700 hover:text-[#1978e5] text-base font-medium leading-normal transition-colors text-left"
            >
              Certificaciones
            </button>
            <button
              onClick={() => scrollToSection("testimonios")}
              className="text-gray-700 hover:text-[#1978e5] text-base font-medium leading-normal transition-colors text-left"
            >
              Testimonios
            </button>
          </nav>
          <div className="mt-auto pb-8 flex flex-col gap-4">
            <Link
              href="/workspace"
              className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#1978e5] hover:bg-blue-700 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em] flex"
            >
              <span className="truncate">Comenzar</span>
            </Link>
            <Link
              href="/workspace"
              className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 text-base font-bold leading-normal tracking-[0.015em] flex"
            >
              <span className="truncate">Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
