import { useState, useEffect } from "react";

/**
 * Hook para debounce de valores
 * Útil para búsqueda en tiempo real
 * @param value - El valor a hacer debounce
 * @param delay - El delay en milisegundos (default: 500ms)
 * @returns El valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up el timeout para actualizar el valor debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup - cancelar el timeout si value cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
