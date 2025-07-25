import Image from "next/image";

const Main = () => {
  return (
    <main className="flex-1">
      <section
        id="inicio"
        className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center text-center px-4 py-16 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 20, 40, 0.6) 0%, rgba(0, 20, 40, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA3twXNmSpy25Bqhb0uHnm2XE20-NnaYdNUYFjOnhdwNsZUj5g_m0GMRzSLEfb2VDRZ66DwIyadwxNgBUrBjgMXXtenYYA7njGyfB_TButg5x5cpGANLaRJh8XySyszm0gmcTOZuJNsDpS-aE8ZWQtjFpZR7Ft9OUkMJ9nWoK-c_6SNIi8N2DFWcJstQsaYoS_If_3hbo_nsCgP7RVsTH7f1UygRE3fTl5GgDP6NvActoCBrKSv8dn2aJuu7mcwxAtLCAHpvSwNnVRn")',
        }}
      >
        <div className="max-w-4xl">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6 mt-10">
            Lidera el Cambio en Criminología Corporativa y Compliance
          </h1>
          <p className="text-gray-200 text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-8">
            Desarrolla tu carrera con nuestros programas especializados en
            prevención de delitos corporativos y gestión de cumplimiento
            normativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex min-w-[120px] max-w-[480px] mx-auto sm:mx-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 sm:h-14 sm:px-8 bg-[#1978e5] hover:bg-blue-700 transition-colors text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Explorar Programas</span>
            </button>
            <button className="flex min-w-[120px] max-w-[480px] mx-auto sm:mx-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 sm:h-14 sm:px-8 bg-transparent hover:bg-white/10 border-2 border-white transition-colors text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Ver Certificaciones</span>
            </button>
          </div>
        </div>
      </section>
      <section
        id="por-que-eiccc"
        className="py-16 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#1978e5] font-semibold text-sm uppercase tracking-wider">
              ¿Por qué elegir EICCC?
            </span>
            <h2 className="text-gray-800 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mt-2">
              Excelencia en Formación Corporativa
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Somos la institución líder en formación de profesionales
              especializados en criminología corporativa, compliance y
              prevención de delitos en el ámbito empresarial.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1978e5]/10 text-[#1978e5] mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-[#1978e5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 14l9-5-9-5-9 5 9 5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 14l9-5-9-5-9 5 9 5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(0 4)"
                  />
                  <path
                    d="M12 14l9-5-9-5-9 5 9 5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(0 8)"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Programas Especializados
              </h3>
              <p className="text-gray-600">
                Aprende de expertos internacionales en criminología corporativa
                y compliance, con enfoque en casos prácticos y situaciones
                reales.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1978e5]/10 text-[#1978e5] mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-[#1978e5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15l-3-3m0 0l3-3m-3 3h6m-6 0v6m0-6h6m-6 0v-6m6 0v6m0-6v-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Certificaciones Internacionales
              </h3>
              <p className="text-gray-600">
                Obtén certificaciones reconocidas globalmente que validan tu
                experiencia en prevención de delitos corporativos y gestión de
                compliance.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1978e5]/10 text-[#1978e5] mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-[#1978e5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Red Global de Profesionales
              </h3>
              <p className="text-gray-600">
                Conéctate con una comunidad internacional de expertos en
                compliance y criminología corporativa, facilitando el
                intercambio de mejores prácticas.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="programas" className="py-16 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Programas Destacados
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestros programas más demandados, diseñados para formar
              líderes en criminología corporativa y compliance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect">
              <div
                className="w-full h-56 bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDu_lla23IpNPKy-aXEfAo8-824StdeTThCIwoX6Bqc2uvk-QuUaWxhqA4KlgAQGA8T2JxhwvzfabJNjv5ItkQ7eAVkzxsH4mX-mqQXQjyn_3-VqjDYWtaw6u8-AtZVHORx6yygLSjAZ8dtcPNhOuJV9z0KVhz3Kko3XI4K2NRDA153GT4BxUVm4I11znaISwM8CbI-4_6ApsZ4Z-1UMWbZA03DuUIeKsL7s2uMJJSvffrpZRxCav0LHm0tF3sVttnAD5SVQqnCAehx")',
                }}
              ></div>
              <div className="p-6 flex-grow">
                <h3 className="text-gray-800 text-xl font-semibold leading-snug mb-2">
                  Criminología Corporativa: Prevención y Detección
                </h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">
                  Aprende las técnicas avanzadas para prevenir y detectar
                  delitos en el ámbito corporativo.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <a
                  className="text-[#1978e5] hover:text-blue-700 text-sm font-semibold inline-flex items-center"
                  href="#"
                >
                  Learn More{" "}
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect">
              <div
                className="w-full h-56 bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIv14GDuG7IFNvF91F1nY9mZLbTtcS5-NRDhXzbVc01gXvVmr-OgJRzVhgKOQW8b_yIkFVjPWMObkmlkS54wZNC9P9U5HL-FQYhOD6KIyEZny0D0f_fByp8MdWN-Z3uaANbCnxHyUkhHh_K5ni7SpmOItAWQXpVN_BgdPX11FDoXd7z1gJPCyKUIQNrUu2hP-ZWzoMo0Anl6bnrhAshP8-Xa0hgLueRLrZ1QKGAAm7HwqnSoIKVUnfYrcXiHH-WwC5vl-Q3uuYLnA4")',
                }}
              ></div>
              <div className="p-6 flex-grow">
                <h3 className="text-gray-800 text-xl font-semibold leading-snug mb-2">
                  Compliance y Gestión de Riesgos
                </h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">
                  Domina las estrategias de cumplimiento normativo y gestión de
                  riesgos corporativos.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <a
                  className="text-[#1978e5] hover:text-blue-700 text-sm font-semibold inline-flex items-center"
                  href="#"
                >
                  Learn More{" "}
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect">
              <div
                className="w-full h-56 bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAF9JLvuFWMfBWnDADTAtiz59_pJQGStYa6NupJArWQWtNUWJ5IB-z9Vn2CQ-zEu36pcOTRXzsdjkBaKTlgELDxOnlrxVusR1uskKQhmtvUWwbuMs_dxlmZESRQtsDqf3ZhulRZyaSr0lrWzsGQkhF8QP8gKV2THRNsK3mCjyHSy2e0EkgTRU9ibZyY-ASLO1d9ehEh3TWPyRv_DWOghRxVMlBm-yAI-f_5FM3s0jTe7SyIbz-MjRu5dMKYNUMtWClUrnS8SbQ5uP4f")',
                }}
              ></div>
              <div className="p-6 flex-grow">
                <h3 className="text-gray-800 text-xl font-semibold leading-snug mb-2">
                  Investigación de Delitos Corporativos
                </h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">
                  Desarrolla habilidades en investigación y análisis de delitos
                  en el entorno empresarial.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <a
                  className="text-[#1978e5] hover:text-blue-700 text-sm font-semibold inline-flex items-center"
                  href="#"
                >
                  Learn More{" "}
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <button className="flex min-w-[120px] max-w-[480px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#1978e5] hover:bg-blue-700 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Ver Todos los Programas</span>
            </button>
          </div>
        </div>
      </section>
      <section
        id="certificaciones"
        className="bg-gray-100 py-16 lg:py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Certificaciones Profesionales
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Valida tu experiencia y avanza en tu carrera con nuestras
              certificaciones especializadas en criminología corporativa y
              compliance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect">
              <div
                className="w-full h-56 bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4rDTVkAcns5PJI05cWpLWSxCdLqPpj__ewRc5I977voK-TpNBpWO6he8ZI6lfyW5fylRuqBIzPZ1TgSfJ18LdzH32GkkLvyvUr5aeqq4HD8r3K-E3CAipRE09bP96JO5KLy5N8NPxHZ0VI-Vimdcgj2AqT1HvRK1MAoZIzWrgwW4c6PMkwfK9tQvadCwfPODOsfH1gU8fWy1Rxbb_ST42opW0sWLRan5rIz7SBnw6xi2jSFFlAI-oJwLTH9jYBthZongszbuig0W4")',
                }}
              ></div>
              <div className="p-6 flex-grow">
                <h3 className="text-gray-800 text-xl font-semibold leading-snug mb-2">
                  Especialista en Compliance Corporativo
                </h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">
                  Demuestra tu experiencia en gestión de cumplimiento normativo
                  y prevención de riesgos corporativos.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <a
                  className="text-[#1978e5] hover:text-blue-700 text-sm font-semibold inline-flex items-center"
                  href="#"
                >
                  View Certification{" "}
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect">
              <div
                className="w-full h-56 bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8mNgwHnQMRw3Y6YnugVYpDWTQ_XVSks1YtVwDe7KMkUNmgPybGj4-GFaY6U2PUuiNQ3LHqJ4uhGdvTz8EbwcNGgZJLZKMWtj0jdQ9HevX8xkBpXQMsy-wgSZy_aEa48XVvk6fi5uUijYBlo2tDpHeofjiUlH8d8zlkZeIihwZDBmA6ZmqjqFO4g46NkoNWn7d4oUgaFrS7ta9cycUeu3f9SG3MUb2SzTOeYL-GgZ2c0-XCMRQrSiBnGpF4XTue46v_jn1ABZGz5f3")',
                }}
              ></div>
              <div className="p-6 flex-grow">
                <h3 className="text-gray-800 text-xl font-semibold leading-snug mb-2">
                  Experto en Criminología Corporativa
                </h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">
                  Valida tus conocimientos en prevención y detección de delitos
                  en el ámbito empresarial.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <a
                  className="text-[#1978e5] hover:text-blue-700 text-sm font-semibold inline-flex items-center"
                  href="#"
                >
                  View Certification{" "}
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect">
              <div
                className="w-full h-56 bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDmBfkaOcgFrbDAPuY_hiDVeVrhU4OBempQbQa7dTNpUqYgasQA1a-5HvTPLkQrBAB03BerHpNBm1mMH79llr603c1H4KOVTZyuziqOQWhZZsGPpEEwsAK192505jnl93X-oMscBbXWI0tmE-PnH6nf84DuZS8vxZeqnrJl-WC9L2GcZgbuCyT6jCU05UwdFCmXs3XQCPCl8pAGTRLO_mCsxPTI5LFGshYLWAQLidL3PTiJK6VA4V6we_rO3OoZO21ljtUmGHz4RRKh")',
                }}
              ></div>
              <div className="p-6 flex-grow">
                <h3 className="text-gray-800 text-xl font-semibold leading-snug mb-2">
                  Certificado en Investigación Corporativa
                </h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">
                  Muestra tu dominio en técnicas de investigación y análisis de
                  delitos corporativos.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <a
                  className="text-[#1978e5] hover:text-blue-700 text-sm font-semibold inline-flex items-center"
                  href="#"
                >
                  View Certification{" "}
                  <svg
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <button className="flex min-w-[120px] max-w-[480px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#1978e5] hover:bg-blue-700 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">
                Descubrir Todas las Certificaciones
              </span>
            </button>
          </div>
        </div>
      </section>
      <section
        id="testimonios"
        className="py-16 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Lo que Dicen Nuestros Graduados
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Escucha a los profesionales que han transformado sus carreras con
              EICCC.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  alt="User avatar"
                  className="w-12 h-12 rounded-full mr-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbrZBpJiGjNEXazDmwBYxv_9HosQVUAZcXEq7S624THjUENW5_fWw_qG_WTIknTuM6y2MlZsLw8QSp3Hoaql3T-WBnI7zafxzHZAsyFVuQPCQnNDngbK5csVH_U6XxEZ4BRvtk0FkvO5v_X2ALUxmhjVcDxC5cqVCarH92adx4WJMQ4ykaXvHqRm90IqBscZuauI2ehtR_TkzI7xEgqXGbovdRPuAatUtw5JmMBF01cxgC_iFBbouYu-aXGmr9gn2ieq-zQl2BvewG"
                  width={48}
                  height={48}
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Juan Pérez</h4>
                  <p className="text-sm text-gray-500">
                    Director de Compliance, XYZ Corp
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                &quot;El programa de Compliance Corporativo me proporcionó
                herramientas invaluables que aplico diariamente. Los
                instructores fueron excepcionales y la plataforma muy
                intuitiva.&quot;
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  alt="User avatar"
                  className="w-12 h-12 rounded-full mr-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFSLjS-XZB-UdiGleYE9ePN3Mfm8ZLsToaOuvIO-XqUmcDUho6ieLyk_p6R8dInyc7H8Jw-psn40gSojok9b3AHgdMLi11QynHKB86AZ23N3vYsi_Esx8kz8z8C49JNZPr8Z2r8JF4oFc8_URUi4KYtAL4349BAxnJgdWKDn8PTdJnfm3c9JW5t8r3afAH_e0qyYCI8f4X87k5c1TFeLMMe89gNINMgrDd09N4NFxUAdfrhGJK3ams8cYrUhPA-x4J5X1uvhre96J1"
                  width={48}
                  height={48}
                />
                <div>
                  <h4 className="font-semibold text-gray-800">Ana Silva</h4>
                  <p className="text-sm text-gray-500">
                    Especialista en Prevención de Delitos Corporativos
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                &quot;La certificación en Criminología Corporativa de EICCC
                mejoró significativamente mi perfil profesional. El contenido
                práctico y el networking fueron excelentes.&quot;
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  alt="User avatar"
                  className="w-12 h-12 rounded-full mr-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQkfS2KyPGDukB350IRXhRZLYJ9XdO4H3mGukQAGmH4nmCez-fhM3Rgyvfr_a9_LoTvSh00c9JLYxTaZT43YPmyo_ozKBgwqkD__O8XcWKWQb-K70D_s9ziIywRCOtQnhT3WldGyfPApuBVr_rVs3w9OKmjPNtrZDe1DJC9hK0ZmbrJ8BMGNbdw8ZBQvqdPNXjl9DxdRyjJAjcShxcJHvgSHJuKnsGuqYaWkBHDe0QHNEtjWgzjY_Go4UgfYlGM61i94FF6tX_E3YY"
                  width={48}
                  height={48}
                />
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Carlos Rodríguez
                  </h4>
                  <p className="text-sm text-gray-500">
                    Investigador Corporativo
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                &quot;El programa de Investigación Corporativa fue
                increíblemente práctico. Pude aplicar inmediatamente las
                técnicas aprendidas en mi trabajo. ¡Altamente recomendado!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        id="alianzas"
        className="py-16 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gray-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-800 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Alianzas Estratégicas
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Colaboramos con instituciones líderes para garantizar la más alta
              calidad en formación corporativa.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
            <div className="flex justify-center">
              <Image
                alt="Institution Logo 1"
                className="max-h-24 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhm_VKbWzEdsVx3HX7_ENWzMI5iSpqubCJOxkjrnAfJK8Ljyiu2KKLx7WFYWZSU1ruT0nBC7AOYjw0T7x3xV2431QBonaEUbbxqFt2oIEvcRCLuyFo6JefcXsSpek-eCHsuOkdWekS_gqOONPHc0X9OIiMHZvS3O7520dr5H-7k1BXuai3I1hxlZrtnHk25S-wSshhdCQXur5UZQ1MJddTIn83qYe7xxCkTWvHpB5xCZ01N4Ng_FwTWrSVsDLzY124PRokzNDO8hKo"
                width={100}
                height={50}
              />
            </div>
            <div className="flex justify-center">
              <Image
                alt="Institution Logo 2"
                className="max-h-24 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCVruF7w5pLpv-bYu_QTE6eoU8fEaAxBnJG2l8qX-fqpfpQPRfkiR5BXlbNqEo-NDVEYFFzpIT7zRS9b-g23I8v0kVynkky_Xn_FF8I4keyncH5AgXU-oNTnMolVUIsbwzyrTkemul2FjkbQAJykbQ016LFwfstyuoh47Swy9AlMFSEKJIl1wL-GliVBov7mBkrAsbj8N5JLmRsvuHhgO_hS_YItto7KUK-r5QbdrC8EmOVp5-G4LopCmyp-E9ZkS5y6ZW3tGX-wXQ"
                width={100}
                height={50}
              />
            </div>
            <div className="flex justify-center">
              <Image
                alt="Institution Logo 3"
                className="max-h-24 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXRePDD4gf51SOR0L3cx-S_uVnh7ArAqJDwmjaG9atbRKJpO9B-zOoc6USYux99w8aY2wFjj1ktj2CPYiMe65gUu0yGCsc_fTBun8raMcynU4ThCzcvP2H30lUlpucrqLQfan6-UJvrGcGaVN0rGPXYsnQzIjVzDsFVC5n4_M7RKsMzWg7RmQ1yh67PQZjxK6qZePM2ViFJiY80_ZAQRVY1P30J4MZ5lgiQs_7c3mMWwPaINf_epbg4DPBLVGn8CYjaqhSmLC5OoiH"
                width={100}
                height={50}
              />
            </div>
            <div className="flex justify-center">
              <Image
                alt="Institution Logo 4"
                className="max-h-24 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7tpSfuTj3X96MeAbliJui07je-n_HYg-v0fRdbobWwAQYG1BaDEuER81vPHPo9IwotW7ItKw64VB0dRkzSVzQvcx1Gl-jL9M_4oprn91_45c31TM6Is9cFFWisGbUyRdcRtug3ujtVUXZxCLyf73Op2QAQJjvq9XTt08vQY_ZP1u9SKHjK-Zaz1l762_9BDarILT8H4V3XxBUSPg8jx9kV3E5wsw66pgdlaAT0TKMkysBoKOihyihdnvcgwHCbWqOZ0WCd-vzY-GV"
                width={100}
                height={50}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#1978e5] text-white py-16 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <svg
            className="h-16 w-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-6">
            ¿Listo para Transformar tu Carrera en Compliance?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-8">
            Únete a nuestra comunidad global de profesionales en criminología
            corporativa. Comienza tu viaje de aprendizaje hoy con EICCC y
            desbloquea tu máximo potencial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex min-w-[120px] max-w-[480px] mx-auto sm:mx-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 sm:h-14 sm:px-8 bg-white hover:bg-gray-100 transition-colors text-[#1978e5] text-base sm:text-lg font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Inscribirse en un Programa</span>
            </button>
            <button className="flex min-w-[120px] max-w-[480px] mx-auto sm:mx-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 sm:h-14 sm:px-8 bg-transparent hover:bg-white/20 border-2 border-white transition-colors text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Solicitar Información</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
