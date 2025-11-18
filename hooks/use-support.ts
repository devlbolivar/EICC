import { useState, useEffect, useCallback } from "react";
import {
  SupportTicket,
  SupportMessage,
  CreateTicketRequest,
  CreateMessageRequest,
  TicketWithMessages
} from "@/app/types";
import { API_ROUTES } from "@/lib/constants";

interface UseSupportOptions {
  autoFetch?: boolean;
}

interface UseSupportReturn {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (status?: string) => Promise<void>;
  createTicket: (data: CreateTicketRequest) => Promise<SupportTicket | null>;
  getTicket: (id: string) => Promise<TicketWithMessages | null>;
  updateTicketStatus: (id: string, status: string) => Promise<SupportTicket | null>;
  addMessage: (data: CreateMessageRequest) => Promise<SupportMessage | null>;
  refetch: () => Promise<void>;
}

export function useSupport(options: UseSupportOptions = {}): UseSupportReturn {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = status
        ? `${API_ROUTES.SUPPORT.TICKETS}?status=${status}`
        : API_ROUTES.SUPPORT.TICKETS;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener los tickets");
      }

      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(
    async (data: CreateTicketRequest): Promise<SupportTicket | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ROUTES.SUPPORT.TICKETS, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear el ticket");
        }

        const result = await response.json();

        if (result.success) {
          // Refresh tickets list
          await fetchTickets();
          return result.ticket;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error creating ticket:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTickets]
  );

  const getTicket = useCallback(
    async (id: string): Promise<TicketWithMessages | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ROUTES.SUPPORT.TICKETS}/${id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener el ticket");
        }

        const result = await response.json();

        if (result.success) {
          return {
            ticket: result.ticket,
            messages: result.messages,
          };
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching ticket:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTicketStatus = useCallback(
    async (id: string, status: string): Promise<SupportTicket | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ROUTES.SUPPORT.TICKETS}/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar el ticket");
        }

        const result = await response.json();

        if (result.success) {
          // Update local state
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === id ? { ...ticket, status: result.ticket.status } : ticket
            )
          );
          return result.ticket;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error updating ticket:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addMessage = useCallback(
    async (data: CreateMessageRequest): Promise<SupportMessage | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ROUTES.SUPPORT.MESSAGES, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al enviar el mensaje");
        }

        const result = await response.json();

        if (result.success) {
          return result.message;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error adding message:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(() => {
    return fetchTickets();
  }, [fetchTickets]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchTickets();
    }
  }, [fetchTickets, options.autoFetch]);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    getTicket,
    updateTicketStatus,
    addMessage,
    refetch,
  };
}

// Hook for admin support management
interface UseAdminSupportReturn {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  statistics: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    urgent: number;
    high: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchTickets: (options?: { status?: string; priority?: string; page?: number }) => Promise<void>;
  getTicket: (id: string) => Promise<TicketWithMessages | null>;
  updateTicket: (ticketId: string, data: { status?: string; assignedTo?: string; priority?: string }) => Promise<SupportTicket | null>;
  addStaffReply: (ticketId: string, message: string) => Promise<SupportMessage | null>;
  refetch: () => Promise<void>;
}

export function useAdminSupport(): UseAdminSupportReturn {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchTickets = useCallback(
    async (options?: { status?: string; priority?: string; page?: number }) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options?.status) params.append("status", options.status);
        if (options?.priority) params.append("priority", options.priority);
        if (options?.page) params.append("page", String(options.page));

        const url = `${API_ROUTES.SUPPORT.ADMIN_TICKETS}?${params.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener los tickets");
        }

        const data = await response.json();

        if (data.success) {
          setTickets(data.tickets);
          setStatistics(data.statistics);
          setPagination(data.pagination);
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching admin tickets:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getTicket = useCallback(
    async (id: string): Promise<TicketWithMessages | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_ROUTES.SUPPORT.ADMIN_TICKETS}/${id}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener el ticket");
        }

        const result = await response.json();

        if (result.success) {
          return {
            ticket: result.ticket,
            messages: result.messages,
          };
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching ticket:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTicket = useCallback(
    async (
      ticketId: string,
      data: { status?: string; assignedTo?: string; priority?: string }
    ): Promise<SupportTicket | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ROUTES.SUPPORT.ADMIN_TICKETS, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketId, ...data }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar el ticket");
        }

        const result = await response.json();

        if (result.success) {
          // Update local state
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === ticketId ? { ...ticket, ...result.ticket } : ticket
            )
          );
          return result.ticket;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error updating ticket:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addStaffReply = useCallback(
    async (ticketId: string, message: string): Promise<SupportMessage | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/support/admin/messages", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketId, message }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al enviar el mensaje");
        }

        const result = await response.json();

        if (result.success) {
          return result.message;
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error adding staff reply:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(() => {
    return fetchTickets();
  }, [fetchTickets]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    statistics,
    pagination,
    fetchTickets,
    getTicket,
    updateTicket,
    addStaffReply,
    refetch,
  };
}
