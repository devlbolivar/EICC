/**
 * Utilidades seguras para acceso a localStorage/sessionStorage
 * Compatible con SSR (Server-Side Rendering)
 */

export const safeLocalStorage = {
  /**
   * Obtener valor de localStorage de forma segura
   */
  getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },

  /**
   * Guardar valor en localStorage de forma segura
   */
  setItem(key: string, value: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remover valor de localStorage de forma segura
   */
  removeItem(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  /**
   * Limpiar localStorage de forma segura
   */
  clear(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};

// Versión para sessionStorage
export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing sessionStorage key "${key}":`, error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
      return false;
    }
  },

  clear(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
      return false;
    }
  },
};
