import "@testing-library/jest-dom";

// Polyfill for TextDecoder (needed for Neon database)
global.TextDecoder = global.TextDecoder || require("util").TextDecoder;
global.TextEncoder = global.TextEncoder || require("util").TextEncoder;

// Mock Web APIs for Edge Runtime (needed for Next.js API routes)
// Force mock even if Request exists to avoid Next.js conflicts
global.Request = class Request {
    constructor(input, init) {
      // Use defineProperty to avoid conflicts with read-only properties
      const url = typeof input === "string" ? input : input.url;
      const method = init?.method || "GET";
      const headers = new Headers(init?.headers || {});
      const body = init?.body;
      
      Object.defineProperty(this, 'url', { value: url, writable: false, configurable: true });
      Object.defineProperty(this, 'method', { value: method, writable: false, configurable: true });
      Object.defineProperty(this, 'headers', { value: headers, writable: false, configurable: true });
      Object.defineProperty(this, 'body', { value: body, writable: false, configurable: true });
      Object.defineProperty(this, '_bodyText', { value: body, writable: false, configurable: true });
    }
    
    async text() {
      return this._bodyText || "";
    }
    
    async json() {
      return JSON.parse(this._bodyText || "{}");
    }
    
    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      });
    }
  };

global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "OK";
      this.headers = new Headers(init?.headers || {});
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    async text() {
      return typeof this.body === "string" ? this.body : JSON.stringify(this.body);
    }
    
    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }
    
    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
    
    // Static method for creating JSON responses (like NextResponse.json)
    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    }
  };

global.Headers = class Headers {
    constructor(init) {
      this._headers = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    get(name) {
      return this._headers.get(name.toLowerCase()) || null;
    }
    
    set(name, value) {
      this._headers.set(name.toLowerCase(), String(value));
    }
    
    has(name) {
      return this._headers.has(name.toLowerCase());
    }
    
    delete(name) {
      this._headers.delete(name.toLowerCase());
    }
    
    forEach(callback, thisArg) {
      this._headers.forEach((value, key) => callback.call(thisArg, value, key, this));
    }
    
    entries() {
      return this._headers.entries();
    }
    
    keys() {
      return this._headers.keys();
    }
    
    values() {
      return this._headers.values();
    }
  };

// Mock window.matchMedia (needed for responsive hooks)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch for tests that need it (like Stripe)
global.fetch = jest.fn();

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.STRIPE_SECRET_KEY = "sk_test_mock_key_for_testing";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock_webhook_secret";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};
