"use client";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
export default function Home() {
  return (
    <div>
      {/* <h1>Hello World</h1>
      <Button>Click me</Button>
      <UserButton /> */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <a href="#" className="flex-shrink-0">
                <span className="font-logo text-2xl text-cca-blue">
                  ComplianceCert Academy ✨
                </span>
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <form className="relative">
                <label htmlFor="search-header" className="sr-only">
                  Find your course
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="search"
                    className="lucide lucide-search text-gray-400 h-5 w-5"
                  >
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                </div>
                <input
                  type="search"
                  id="search-header"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                                      leading-5 bg-white placeholder-gray-500 focus:outline-none
                                      focus:ring-cca-blue focus:border-cca-blue sm:text-sm"
                  placeholder="Find your course (e.g. OSHA 10)"
                />
              </form>
              <button
                type="button"
                data-modal-target="login-modal"
                data-modal-toggle="login-modal"
                className="text-cca-blue hover:text-cca-blue/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Login
              </button>
              <button
                type="button"
                data-modal-target="signup-modal"
                data-modal-toggle="signup-modal"
                className="text-white bg-cca-blue hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Sign Up
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button
                data-collapse-toggle="mobile-menu"
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cca-blue"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-lucide="menu"
                  className="lucide lucide-menu h-6 w-6"
                >
                  <path d="M4 12h16"></path>
                  <path d="M4 18h16"></path>
                  <path d="M4 6h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </nav>
        {/* Mobile menu, show/hide based on menu state */}
        <div className="hidden md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <form className="px-2 mb-2">
              <label htmlFor="search-mobile" className="sr-only">
                Find your course
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="search"
                    className="lucide lucide-search text-gray-400 h-5 w-5"
                  >
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                </div>
                <input
                  type="search"
                  id="search-mobile"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                                      leading-5 bg-white placeholder-gray-500 focus:outline-none
                                      focus:ring-cca-blue focus:border-cca-blue sm:text-sm"
                  placeholder="Find your course"
                />
              </div>
            </form>
            <button
              type="button"
              data-modal-target="login-modal"
              data-modal-toggle="login-modal"
              className="block w-full text-left text-gray-700 hover:bg-gray-50 hover:text-cca-blue px-3 py-2 rounded-md text-base font-medium"
            >
              Login
            </button>
            <button
              type="button"
              data-modal-target="signup-modal"
              data-modal-toggle="signup-modal"
              className="block w-full text-left text-white bg-cca-blue hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-base px-3 py-2"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="hero" className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <span className="text-cca-blue font-semibold uppercase tracking-wider text-sm">
                  Online Learning Platform for Certification
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-cca-text tracking-tight">
                  Trusted Certifications: <br className="hidden sm:inline" />
                  Get Certified, Stay Compliant.
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                  Access a wide range of courses: OSHA 10/30, HIPAA 101, Hazmat,
                  and more. Learn on-demand with expert instructors and track
                  your progress seamlessly.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row sm:justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <a
                    href="#courses"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-cca-blue hover:bg-blue-700 shadow-lg transform transition hover:scale-105_"
                  >
                    Explore Courses{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-lucide="arrow-right"
                      className="lucide lucide-arrow-right ml-2 h-5 w-5"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                  <a
                    href="#for-teams"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-cca-green hover:bg-green-600 shadow-lg transform transition hover:scale-105_"
                  >
                    For Teams{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-lucide="users"
                      className="lucide lucide-users ml-2 h-5 w-5"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="mt-12 md:mt-0">
                <img
                  src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://www.svgrepo.com/show/508699/landscape-placeholder.svg")
                  }
                  alt="Diverse professionals engaged in online learning and certification"
                  className="rounded-xl shadow-2xl aspect-video object-cover w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-cca-neutral-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-cca-text sm:text-4xl">
                Why Choose ComplianceCert Academy?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Empowering you with knowledge, recognized certifications, and
                flexible learning.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-cca-blue text-white rounded-full w-12 h-12 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="award"
                    className="lucide lucide-award lucide-lg"
                  >
                    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                    <circle cx="12" cy="8" r="6"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cca-text mb-2">
                  Industry-Recognized Certifications
                </h3>
                <p className="text-gray-600">
                  Gain valuable certifications like OSHA, HIPAA, Hazmat, and
                  more to boost your career and ensure compliance.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-cca-green text-white rounded-full w-12 h-12 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="book-open-check"
                    className="lucide lucide-book-open-check lucide-lg"
                  >
                    <path d="M12 21V7"></path>
                    <path d="m16 12 2 2 4-4"></path>
                    <path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cca-text mb-2">
                  Comprehensive Course Catalog
                </h3>
                <p className="text-gray-600">
                  A wide array of courses designed by experts to meet regulatory
                  requirements and industry standards.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-cca-orange text-white rounded-full w-12 h-12 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="clock"
                    className="lucide lucide-clock lucide-lg"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cca-text mb-2">
                  On-Demand Learning
                </h3>
                <p className="text-gray-600">
                  Learn at your own pace, anytime, anywhere. Our platform is
                  accessible 24/7 on all your devices.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-cca-blue text-white rounded-full w-12 h-12 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="graduation-cap"
                    className="lucide lucide-graduation-cap lucide-lg"
                  >
                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                    <path d="M22 10v6"></path>
                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cca-text mb-2">
                  Expert Instructors
                </h3>
                <p className="text-gray-600">
                  Learn from seasoned professionals and subject matter experts
                  dedicated to your success.
                </p>
              </div>
              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-cca-green text-white rounded-full w-12 h-12 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="clipboard-check"
                    className="lucide lucide-clipboard-check lucide-lg"
                  >
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <path d="m9 14 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cca-text mb-2">
                  Progress Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor your learning journey with intuitive progress tracking
                  and course completion dashboards.
                </p>
              </div>
              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-cca-orange text-white rounded-full w-12 h-12 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-lucide="users-round"
                    className="lucide lucide-users-round lucide-lg"
                  >
                    <path d="M18 21a8 8 0 0 0-16 0"></path>
                    <circle cx="10" cy="8" r="5"></circle>
                    <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cca-text mb-2">
                  Solutions for Organizations
                </h3>
                <p className="text-gray-600">
                  Affordable pricing, custom plans, bulk discounts, and robust
                  reporting for teams and businesses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section for exploring courses / pricing */}
        <section id="courses" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-cca-text sm:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Browse our extensive course catalog and find the perfect
              certification for your needs. Affordable options available for
              individuals and teams.
            </p>
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-cca-orange hover:bg-orange-600 shadow-lg"
              >
                Browse All Courses
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-cca-neutral-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-cca-text sm:text-4xl">
                What Our Learners Say
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Real stories from professionals who advanced their careers with
                us.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-xl shadow-lg testimonial-card">
                <div className="flex items-center mb-4">
                  <img
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://www.svgrepo.com/show/508699/landscape-placeholder.svg")
                    }
                    alt="John Doe"
                  />
                  <div>
                    <p className="font-semibold text-cca-text">John Doe</p>
                    <p className="text-sm text-gray-500">
                      Safety Manager, BuildSafe Inc.
                    </p>
                  </div>
                </div>
                <i className="fas fa-quote-left text-cca-blue text-2xl mb-2 opacity-50"></i>
                <p className="text-gray-600 italic leading-relaxed">
                  "The OSHA 30 course was incredibly comprehensive and easy to
                  follow. ComplianceCert Academy helped our team stay up-to-date
                  with safety regulations efficiently."
                </p>
              </div>
              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-xl shadow-lg testimonial-card">
                <div className="flex items-center mb-4">
                  <img
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://www.svgrepo.com/show/508699/landscape-placeholder.svg")
                    }
                    alt="Jane Smith"
                  />
                  <div>
                    <p className="font-semibold text-cca-text">Jane Smith</p>
                    <p className="text-sm text-gray-500">
                      HR Specialist, HealthPro Clinic
                    </p>
                  </div>
                </div>
                <i className="fas fa-quote-left text-cca-blue text-2xl mb-2 opacity-50"></i>
                <p className="text-gray-600 italic leading-relaxed">
                  "HIPAA 101 was exactly what our new hires needed. The platform
                  is user-friendly, and progress tracking made management
                  simple. Highly recommend!"
                </p>
              </div>
              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-xl shadow-lg testimonial-card">
                <div className="flex items-center mb-4">
                  <img
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://www.svgrepo.com/show/508699/landscape-placeholder.svg")
                    }
                    alt="Alex Johnson"
                  />
                  <div>
                    <p className="font-semibold text-cca-text">Alex Johnson</p>
                    <p className="text-sm text-gray-500">
                      Logistics Coordinator, ChemLogix
                    </p>
                  </div>
                </div>
                <i className="fas fa-quote-left text-cca-blue text-2xl mb-2 opacity-50"></i>
                <p className="text-gray-600 italic leading-relaxed">
                  "The Hazmat transportation course was thorough and relevant. I
                  feel much more confident in my role thanks to ComplianceCert
                  Academy."
                </p>
              </div>
            </div>
            <div className="mt-8 text-center md:hidden">
              {" "}
              {/* Scroll hint for mobile */}
              <p className="text-sm text-gray-500">
                (Scroll right for more testimonials)
              </p>
            </div>
          </div>
        </section>

        {/* For Teams/Organizations Section */}
        <section id="for-teams" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center bg-cca-blue text-white p-8 md:p-12 rounded-xl shadow-xl">
              <div>
                <h2 className="text-3xl font-extrabold sm:text-4xl">
                  Empower Your Organization
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Provide your team with essential compliance training through
                  our flexible and affordable plans. Benefit from bulk
                  discounts, custom learning paths, and comprehensive reporting
                  tools.
                </p>
                <ul className="mt-6 space-y-2 text-blue-50">
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data-lucide="check-circle"
                      className="lucide lucide-check-circle h-5 w-5 mr-2 mt-1 text-cca-green"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>{" "}
                    Custom Training Plans
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data-lucide="check-circle"
                      className="lucide lucide-check-circle h-5 w-5 mr-2 mt-1 text-cca-green"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>{" "}
                    Bulk Enrollment Discounts
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data-lucide="check-circle"
                      className="lucide lucide-check-circle h-5 w-5 mr-2 mt-1 text-cca-green"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>{" "}
                    Team Progress Monitoring
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      data-lucide="check-circle"
                      className="lucide lucide-check-circle h-5 w-5 mr-2 mt-1 text-cca-green"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>{" "}
                    Dedicated Support
                  </li>
                </ul>
                <div className="mt-10">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-cca-blue bg-white hover:bg-gray-100 shadow-lg"
                  >
                    Request a Demo for Teams
                  </a>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://www.svgrepo.com/show/508699/landscape-placeholder.svg")
                  }
                  alt="Professional team collaborating in an office environment"
                  className="rounded-xl shadow-2xl aspect-video object-cover w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Company
              </h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Partners
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Resources
              </h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Legal
              </h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Connect
              </h3>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook-f fa-lg"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <i className="fab fa-instagram fa-lg"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <i className="fab fa-twitter fa-lg"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <i className="fab fa-linkedin-in fa-lg"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-base text-gray-400">
              © 2024 ComplianceCert Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Support Icon */}
      <button
        id="chat-support-button"
        title="Chat Support"
        className="fixed bottom-6 right-6 bg-cca-blue text-white p-4 rounded-full shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cca-blue transition-colors z-40"
        aria-label="Open chat support"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          data-lucide="message-circle"
          className="lucide lucide-message-circle lucide-lg"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
        </svg>
      </button>

      {/* Login Modal (Flowbite) */}
      <div
        id="login-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-xl shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Login to your Account
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="login-modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  data-lucide="x"
                  className="lucide lucide-x w-4 h-4"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-4 md:p-5">
              <form className="space-y-4" action="#">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="login-email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cca-blue focus:border-cca-blue block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="login-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="login-password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cca-blue focus:border-cca-blue block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-cca-blue dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                      />
                    </div>
                    <div className="ms-3 text-sm">
                      <label
                        htmlFor="remember"
                        className="text-gray-500 dark:text-gray-300"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-cca-blue hover:underline dark:text-blue-500"
                  >
                    Lost Password?
                  </a>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-cca-blue hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Login to your account
                </button>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Not registered?{" "}
                  <button
                    type="button"
                    data-modal-hide="login-modal"
                    data-modal-target="signup-modal"
                    data-modal-toggle="signup-modal"
                    className="text-cca-blue hover:underline dark:text-blue-500"
                  >
                    Create account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal (Flowbite) */}
      <div
        id="signup-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-xl shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create an Account
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="signup-modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  data-lucide="x"
                  className="lucide lucide-x w-4 h-4"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-4 md:p-5">
              <form className="space-y-4" action="#">
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="signup-email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cca-blue focus:border-cca-blue block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Create password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="signup-password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cca-blue focus:border-cca-blue block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    id="signup-confirm-password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cca-blue focus:border-cca-blue block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-cca-blue dark:bg-gray-700_ dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ms-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-light text-gray-500 dark:text-gray-300"
                    >
                      I accept the{" "}
                      <a
                        className="font-medium text-cca-blue hover:underline dark:text-blue-500"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-cca-orange hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-500 dark:hover:bg-orange-600 dark:focus:ring-orange-700"
                >
                  Create account
                </button>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Already have an account?{" "}
                  <button
                    type="button"
                    data-modal-hide="signup-modal"
                    data-modal-target="login-modal"
                    data-modal-toggle="login-modal"
                    className="text-cca-blue hover:underline dark:text-blue-500"
                  >
                    Login here
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
