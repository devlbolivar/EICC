"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  FileText,
  Search,
  BookOpen,
  Users,
  Settings,
  Plus,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { useSupport } from "@/hooks/use-support";
import { CreateTicketDialog } from "@/components/support/create-ticket-dialog";
import { TicketDetailDialog } from "@/components/support/ticket-detail-dialog";
import { TicketStatus, TicketPriority } from "@/app/types";

const CompanySupport = () => {
  const { tickets, loading, error, createTicket } = useSupport();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const supportCategories = [
    {
      id: "all",
      title: "Todos",
      icon: HelpCircle,
      description: "Todas las preguntas",
    },
    {
      id: "billing",
      title: "Facturación",
      icon: FileText,
      description: "Pagos y facturas",
    },
    {
      id: "courses",
      title: "Cursos",
      icon: BookOpen,
      description: "Contenido y acceso",
    },
    {
      id: "employees",
      title: "Empleados",
      icon: Users,
      description: "Gestión y permisos",
    },
    {
      id: "technical",
      title: "Técnico",
      icon: Settings,
      description: "Problemas técnicos",
    },
  ];

  const faqItems = [
    {
      question: "¿Cómo puedo agregar más empleados a mi empresa?",
      answer:
        "Puedes agregar empleados desde la sección 'Empleados' en tu dashboard. Haz clic en 'Invitar Empleado' y envía la invitación por email.",
      category: "employees",
    },
    {
      question: "¿Cuántos cursos están disponibles en mi plan?",
      answer:
        "Tu plan incluye acceso a todos los cursos disponibles en la plataforma. No hay límite en el número de cursos que puedes asignar a tus empleados.",
      category: "courses",
    },
    {
      question: "¿Cómo puedo cambiar mi método de pago?",
      answer:
        "Ve a la sección 'Facturación' y haz clic en 'Métodos de Pago'. Desde ahí puedes agregar, editar o eliminar métodos de pago.",
      category: "billing",
    },
    {
      question: "¿Los certificados tienen fecha de vencimiento?",
      answer:
        "Los certificados generados por la plataforma no tienen fecha de vencimiento. Recibirás notificaciones de renovación según las políticas de tu empresa.",
      category: "courses",
    },
    {
      question: "¿Cómo puedo ver el progreso de mis empleados?",
      answer:
        "Ve a la sección 'Progreso' en tu dashboard para ver estadísticas detalladas del progreso de cada empleado en sus cursos asignados.",
      category: "employees",
    },
    {
      question: "¿Qué hacer si un empleado no puede acceder a un curso?",
      answer:
        "Verifica que el empleado esté inscrito en el curso y que su cuenta esté activa. Si el problema persiste, crea un ticket de soporte técnico.",
      category: "technical",
    },
  ];

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

  const getPriorityLabel = (priority: TicketPriority) => {
    switch (priority) {
      case "low":
        return "Baja";
      case "medium":
        return "Media";
      case "high":
        return "Alta";
      case "urgent":
        return "Urgente";
      default:
        return priority;
    }
  };

  const filteredFaq = faqItems.filter(
    (item) =>
      (selectedCategory === "all" || item.category === selectedCategory) &&
      (searchQuery === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Soporte</h1>
            <p className="text-muted-foreground">Centro de ayuda empresarial</p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Información de contacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat en Vivo</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Disponible</div>
            <p className="text-xs text-muted-foreground">24/7</p>
            <Button className="w-full mt-2" size="sm">
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teléfono</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+56 2 2345 6789</div>
            <p className="text-xs text-muted-foreground">Lun-Vie 9:00-18:00</p>
            <Button className="w-full mt-2" size="sm" variant="outline">
              Llamar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">soporte@eiccc.cl</div>
            <p className="text-xs text-muted-foreground">Respuesta en 24h</p>
            <Button className="w-full mt-2" size="sm" variant="outline">
              Enviar Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tickets de soporte */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Tickets de Soporte</CardTitle>
          <CardDescription>
            Consulta el estado de tus solicitudes de soporte
          </CardDescription>
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
              <h3 className="font-medium mb-2">No tienes tickets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea tu primer ticket para obtener ayuda de nuestro equipo
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                Crear Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString("es-CL")} -
                          Prioridad: {getPriorityLabel(ticket.priority)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preguntas Frecuentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <CardDescription>
                Encuentra respuestas rápidas a las preguntas más comunes
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2 mb-4">
            {supportCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-4 w-4 mr-1" />
                {category.title}
              </Button>
            ))}
          </div>

          {/* FAQ Accordion */}
          {filteredFaq.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron resultados</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaq.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Recursos útiles */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Útiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Documentación</h3>
              <p className="text-sm text-muted-foreground">
                Guías completas y tutoriales
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Ver Documentación
              </Button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Chat en Vivo</h3>
              <p className="text-sm text-muted-foreground">
                Respuestas inmediatas
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Iniciar Chat
              </Button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Horarios</h3>
              <p className="text-sm text-muted-foreground">
                Chat: 24/7 • Tel: 9-18h
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Ver Horarios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={createTicket}
      />

      {selectedTicket && (
        <TicketDetailDialog
          ticketId={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default CompanySupport;
