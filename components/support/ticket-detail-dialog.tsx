"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  SupportTicket,
  SupportMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "@/app/types";
import { useSupport } from "@/hooks/use-support";
import {
  Loader2,
  Send,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface TicketDetailDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailDialog({
  ticketId,
  open,
  onOpenChange,
}: TicketDetailDialogProps) {
  const { getTicket, addMessage, updateTicketStatus, loading } = useSupport({
    autoFetch: false,
  });

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (open && ticketId) {
      loadTicket();
    }
  }, [open, ticketId]);

  const loadTicket = async () => {
    setLoadingTicket(true);
    const result = await getTicket(ticketId);
    if (result) {
      setTicket(result.ticket);
      setMessages(result.messages);
    }
    setLoadingTicket(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    const result = await addMessage({
      ticketId,
      message: newMessage,
    });

    if (result) {
      setMessages([...messages, result]);
      setNewMessage("");
    }
    setSendingMessage(false);
  };

  const handleCloseTicket = async () => {
    const result = await updateTicketStatus(ticketId, "closed");
    if (result) {
      setTicket(result);
    }
  };

  const handleReopenTicket = async () => {
    const result = await updateTicketStatus(ticketId, "open");
    if (result) {
      setTicket(result);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "Abierto";
      case "in_progress":
        return "En Progreso";
      case "resolved":
        return "Resuelto";
      case "closed":
        return "Cerrado";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case "low":
        return "bg-gray-500";
      case "normal":
        return "bg-blue-500";
      case "high":
        return "bg-orange-500";
      case "urgent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority: TicketPriority) => {
    switch (priority) {
      case "low":
        return "Baja";
      case "normal":
        return "Normal";
      case "high":
        return "Alta";
      case "urgent":
        return "Urgente";
      default:
        return priority;
    }
  };

  const getCategoryLabel = (category: TicketCategory) => {
    switch (category) {
      case "technical":
        return "Problema Técnico";
      case "billing":
        return "Facturación";
      case "account":
        return "Cuenta";
      case "other":
        return "Otro";
      default:
        return category;
    }
  };

  if (loadingTicket) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{ticket.subject}</span>
          </DialogTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              {getPriorityLabel(ticket.priority)}
            </Badge>
            <Badge variant="secondary">{getCategoryLabel(ticket.category)}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Ticket description */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Creado el {new Date(ticket.createdAt).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm">{ticket.description}</p>
          </div>

          <Separator />

          {/* Messages */}
          <div className="flex-1 py-4 overflow-y-auto max-h-[300px]">
            <div className="space-y-4 pr-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No hay mensajes adicionales
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isStaffReply ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.isStaffReply
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.isStaffReply ? (
                          <AlertCircle className="h-3 w-3 text-primary" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.isStaffReply ? "Soporte" : msg.user_name || "Tú"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString("es-CL", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Reply section */}
          {ticket.status !== "closed" ? (
            <div className="pt-4 space-y-3">
              <Textarea
                placeholder="Escribe tu mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                disabled={sendingMessage}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleCloseTicket}
                  disabled={loading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cerrar Ticket
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Este ticket está cerrado
              </p>
              <Button variant="outline" onClick={handleReopenTicket}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reabrir Ticket
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
