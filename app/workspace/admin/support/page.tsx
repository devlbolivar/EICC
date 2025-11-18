"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useAdminSupport } from "@/hooks/use-support";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  Loader2,
  AlertTriangle,
  MessageSquare,
  Send,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { SupportTicket, SupportMessage, TicketStatus, TicketPriority } from "@/app/types";

export default function AdminSupportPage() {
  const { isAdmin } = useAdmin();
  const {
    tickets,
    loading,
    error,
    statistics,
    pagination,
    fetchTickets,
    getTicket,
    updateTicket,
    addStaffReply,
  } = useAdminSupport();

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  const handleViewTicket = async (ticketId: string) => {
    const result = await getTicket(ticketId);
    if (result) {
      setSelectedTicket(result.ticket);
      setTicketMessages(result.messages);
      setDetailDialogOpen(true);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    const result = await addStaffReply(selectedTicket.id, replyMessage);
    if (result) {
      setTicketMessages([...ticketMessages, result]);
      setReplyMessage("");
    }
    setSendingReply(false);
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    await updateTicket(ticketId, { status });
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: status as TicketStatus });
    }
  };

  const handleFilterChange = (type: "status" | "priority", value: string) => {
    if (type === "status") {
      setStatusFilter(value);
      fetchTickets({ status: value === "all" ? undefined : value, priority: priorityFilter === "all" ? undefined : priorityFilter });
    } else {
      setPriorityFilter(value);
      fetchTickets({ status: statusFilter === "all" ? undefined : statusFilter, priority: value === "all" ? undefined : value });
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "technical":
        return "Técnico";
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Soporte</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tickets de soporte y asistencia técnica
        </p>
      </div>

      {/* Métricas de soporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tickets Abiertos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.open}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.urgent} urgentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.high} alta prioridad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.resolved}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.closed} cerrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos los tickets
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de tickets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets de Soporte</CardTitle>
                  <CardDescription>
                    Lista de todos los tickets del sistema
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Abiertos</SelectItem>
                      <SelectItem value="in_progress">En Proceso</SelectItem>
                      <SelectItem value="resolved">Resueltos</SelectItem>
                      <SelectItem value="closed">Cerrados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={(v) => handleFilterChange("priority", v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-red-500">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  {error}
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No hay tickets</h3>
                  <p className="text-sm text-muted-foreground">
                    No se encontraron tickets con los filtros seleccionados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            ticket.priority === "urgent"
                              ? "bg-red-500"
                              : ticket.priority === "high"
                              ? "bg-orange-500"
                              : ticket.status === "open"
                              ? "bg-blue-500"
                              : ticket.status === "in_progress"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusLabel(ticket.status)}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                              {getPriorityLabel(ticket.priority)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {ticket.user_email || "Usuario desconocido"} -{" "}
                            {getCategoryLabel(ticket.category)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(ticket.createdAt).toLocaleString("es-CL")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          Ver
                        </Button>
                        {ticket.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(ticket.id, "in_progress")}
                          >
                            Atender
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => fetchTickets({ page: pagination.page - 1 })}
                  >
                    Anterior
                  </Button>
                  <span className="py-2 px-3 text-sm">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchTickets({ page: pagination.page + 1 })}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contacto Directo</CardTitle>
              <CardDescription>
                Información de contacto para soporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-500">soporte@eiccc.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-gray-500">+56 2 2345 6789</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Horario</p>
                  <p className="text-sm text-gray-500">Lun-Vie 9:00-18:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumen Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Urgentes</span>
                <Badge variant="destructive">{statistics.urgent}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alta prioridad</span>
                <Badge className="bg-orange-500">{statistics.high}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendientes</span>
                <Badge className="bg-blue-500">{statistics.open + statistics.inProgress}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de detalle de ticket */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="truncate">{selectedTicket.subject}</span>
                </DialogTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {getStatusLabel(selectedTicket.status)}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                    {getPriorityLabel(selectedTicket.priority)}
                  </Badge>
                  <Badge variant="secondary">
                    {getCategoryLabel(selectedTicket.category)}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Info del usuario */}
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{selectedTicket.user_name || "Usuario"}</span>
                    <span className="text-sm text-muted-foreground">
                      ({selectedTicket.user_email})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Creado: {new Date(selectedTicket.createdAt).toLocaleString("es-CL")}
                  </p>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>

                <Separator />

                {/* Messages */}
                <div className="flex-1 py-4 overflow-y-auto max-h-[200px]">
                  <div className="space-y-4 pr-4">
                    {ticketMessages.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        No hay mensajes adicionales
                      </p>
                    ) : (
                      ticketMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.isStaffReply ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.isStaffReply
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {msg.isStaffReply ? "Soporte" : msg.user_name || "Usuario"}
                              </span>
                              <span className={`text-xs ${msg.isStaffReply ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
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
                {selectedTicket.status !== "closed" && (
                  <div className="pt-4 space-y-3">
                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={3}
                      disabled={sendingReply}
                    />
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        {selectedTicket.status !== "resolved" && (
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolver
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cerrar
                        </Button>
                      </div>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || sendingReply}
                      >
                        {sendingReply ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
