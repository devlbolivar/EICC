"use client";

import { useEffect, useState } from "react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 sm:px-10 py-4 bg-white shadow-sm z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="flex items-center gap-3 text-gray-800">
        <img
          src="/logo-minimalista.png"
          alt="EICCC Logo"
          className="h-10 rounded-md"
        />
        <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-[-0.015em]">
          EICCC
        </h2>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <button
          onClick={() => scrollToSection("programas")}
          className="text-gray-700 hover:text-[#1978e5] text-sm font-medium leading-normal transition-colors"
        >
          Programas
        </button>
        <button
          onClick={() => scrollToSection("certificaciones")}
          className="text-gray-700 hover:text-[#1978e5] text-sm font-medium leading-normal transition-colors"
        >
          Certificaciones
        </button>
        <button
          onClick={() => scrollToSection("testimonios")}
          className="text-gray-700 hover:text-[#1978e5] text-sm font-medium leading-normal transition-colors"
        >
          Testimonios
        </button>
      </nav>
      <div className="flex items-center gap-3">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1978e5] hover:bg-blue-700 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Comenzar</span>
        </button>
        <button className="hidden sm:flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Iniciar Sesión</span>
        </button>
        <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800">
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
  );
};

export default Header;
