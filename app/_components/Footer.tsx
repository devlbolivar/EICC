import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="h-8 w-8 text-[#1978e5]"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                ></path>
              </svg>
              <h2 className="text-white text-2xl font-bold">EICCC</h2>
            </div>
            <p className="text-sm">
              Formando líderes en criminología corporativa y compliance a través
              de educación especializada de clase mundial.
            </p>
            <div className="mt-4 flex space-x-3">
              <a
                className="text-gray-400 hover:text-white transition-colors"
                href="#"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                className="text-gray-400 hover:text-white transition-colors"
                href="#"
              >
                {" "}
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>{" "}
              </a>
              <a
                className="text-gray-400 hover:text-white transition-colors"
                href="#"
              >
                {" "}
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    clip-rule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    fill-rule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Programas
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Certificaciones
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Facultad
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Acerca de</h3>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Nosotros
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Carreras
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Alianzas
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Contáctanos
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Accesibilidad
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-sm">
            © 2024 EICCC - Escuela Internacional de Criminología Corporativa y
            Compliance. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
