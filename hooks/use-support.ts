import { useState, useEffect } from "react";
import {
  SupportTicket,
  SupportMessage,
  TicketStatus,
  TicketPriority,
  TicketWithMessages
} from "@/app/types";

interface SupportStatistics {
  open: number;
  urgent: number;
  inProgress: number;
  high: number;
  resolved: number;
  closed: number;
  total: number;
}

interface SupportPagination {
  page: number;
  totalPages: number;
}

interface UseAdminSupportReturn {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  statistics: SupportStatistics;
  pagination: SupportPagination;
  fetchTickets: (filters?: { status?: string; priority?: string; page?: number }) => Promise<void>;
  getTicket: (ticketId: string) => Promise<TicketWithMessages | null>;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<SupportTicket | null>;
  addStaffReply: (ticketId: string, message: string) => Promise<SupportMessage | null>;
}

// Mock data
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "1",
    userId: "user1",
    subject: "Problema con el acceso al curso",
    description: "No puedo acceder al curso de React Avanzado",
    category: "technical",
    priority: "high",
    status: "open",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user_name: "Juan Pérez",
    user_email: "juan@example.com",
    messagesCount: 1
  },
  {
    id: "2",
    userId: "user2",
    subject: "Factura incorrecta",
    description: "Me cobraron doble este mes",
    category: "billing",
    priority: "urgent",
    status: "in_progress",
    attachments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    user_name: "Maria Garcia",
    user_email: "maria@example.com",
    messagesCount: 2
  },
  {
    id: "3",
    userId: "user3",
    subject: "Sugerencia de nueva funcionalidad",
    description: "Sería genial tener modo oscuro",
    category: "feature_request",
    priority: "low",
    status: "resolved",
    attachments: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    user_name: "Carlos Rodriguez",
    user_email: "carlos@example.com",
    messagesCount: 1
  }
];

const MOCK_MESSAGES: Record<string, SupportMessage[]> = {
  "1": [
    {
      id: "m1",
      ticketId: "1",
      userId: "user1",
      message: "Hola, intento entrar y me da error 403",
      isStaffReply: false,
      attachments: [],
      createdAt: new Date().toISOString(),
      user_name: "Juan Pérez"
    }
  ],
  "2": [
    {
      id: "m2",
      ticketId: "2",
      userId: "user2",
      message: "Revisen mi facturación por favor",
      isStaffReply: false,
      attachments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      user_name: "Maria Garcia"
    },
    {
      id: "m3",
      ticketId: "2",
      userId: "admin1",
      message: "Estamos revisando su caso",
      isStaffReply: true,
      attachments: [],
      createdAt: new Date().toISOString(),
      user_name: "Soporte"
    }
  ],
  "3": [
    {
      id: "m4",
      ticketId: "3",
      userId: "user3",
      message: "Modo oscuro por favor",
      isStaffReply: false,
      attachments: [],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      user_name: "Carlos Rodriguez"
    }
  ]
};

export function useAdminSupport(): UseAdminSupportReturn {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<SupportStatistics>({
    open: 0,
    urgent: 0,
    inProgress: 0,
    high: 0,
    resolved: 0,
    closed: 0,
    total: 0
  });
  const [pagination, setPagination] = useState<SupportPagination>({
    page: 1,
    totalPages: 1
  });

  const fetchTickets = async (filters?: { status?: string; priority?: string; page?: number }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filtered = [...MOCK_TICKETS];

      if (filters?.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }

      if (filters?.priority) {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }

      setTickets(filtered);

      // Calculate stats based on all mock tickets
      const stats = MOCK_TICKETS.reduce((acc, ticket) => {
        acc.total++;
        if (ticket.status === 'open') acc.open++;
        if (ticket.status === 'in_progress') acc.inProgress++;
        if (ticket.status === 'resolved') acc.resolved++;
        if (ticket.status === 'closed') acc.closed++;
        if (ticket.priority === 'urgent') acc.urgent++;
        if (ticket.priority === 'high') acc.high++;
        return acc;
      }, {
        open: 0,
        urgent: 0,
        inProgress: 0,
        high: 0,
        resolved: 0,
        closed: 0,
        total: 0
      });

      setStatistics(stats);
      setPagination({
        page: filters?.page || 1,
        totalPages: 1
      });

    } catch (err) {
      setError("Error al cargar tickets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTicket = async (ticketId: string): Promise<TicketWithMessages | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const ticket = MOCK_TICKETS.find(t => t.id === ticketId);
      if (!ticket) return null;

      return {
        ticket,
        messages: MOCK_MESSAGES[ticketId] || []
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = MOCK_TICKETS.findIndex(t => t.id === ticketId);
      if (index === -1) return null;

      const updatedTicket = { ...MOCK_TICKETS[index], ...updates };
      // In a real app we would update the state/backend here
      return updatedTicket;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const addStaffReply = async (ticketId: string, message: string): Promise<SupportMessage | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newMessage: SupportMessage = {
        id: `m${Date.now()}`,
        ticketId,
        userId: "admin-current",
        message,
        isStaffReply: true,
        attachments: [],
        createdAt: new Date().toISOString(),
        user_name: "Soporte"
      };

      if (MOCK_MESSAGES[ticketId]) {
        MOCK_MESSAGES[ticketId].push(newMessage);
      } else {
        MOCK_MESSAGES[ticketId] = [newMessage];
      }

      return newMessage;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    statistics,
    pagination,
    fetchTickets,
    getTicket,
    updateTicket,
    addStaffReply
  };
}
