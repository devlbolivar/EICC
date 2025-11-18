"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  BookOpen,
  Phone,
  Plus,
  Clock,
  Loader2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useSupport } from "@/hooks/use-support";
import { CreateTicketDialog } from "@/components/support/create-ticket-dialog";
import { TicketDetailDialog } from "@/components/support/ticket-detail-dialog";
import { TicketStatus, TicketPriority } from "@/app/types";

const StudentSupport = () => {
  const { tickets, loading, error, createTicket } = useSupport();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const faqs = [
    {
      question: "¿Cómo puedo inscribirme en un curso?",
      answer:
        "Para inscribirte en un curso, navega al catálogo de cursos, selecciona el curso que te interese y haz clic en el botón 'Inscribirse'. El curso aparecerá automáticamente en tu lista de cursos inscritos.",
    },
    {
      question: "¿Puedo descargar los certificados?",
      answer:
        "Sí, una vez que completes un curso al 100%, podrás descargar tu certificado desde la sección 'Certificados' en tu perfil. Los certificados están disponibles en formato PDF.",
    },
    {
      question: "¿Qué pasa si no puedo completar un curso?",
      answer:
        "No hay problema. Puedes pausar y retomar tus cursos en cualquier momento. Tu progreso se guarda automáticamente y puedes continuar desde donde lo dejaste.",
    },
    {
      question: "¿Los cursos tienen fecha de expiración?",
      answer:
        "No, una vez inscrito en un curso, tendrás acceso ilimitado al contenido. Puedes revisar el material tantas veces como necesites.",
    },
    {
      question: "¿Cómo puedo cambiar mi contraseña?",
      answer:
        "Ve a tu perfil de usuario, haz clic en 'Editar' y luego en la sección 'Seguridad'. Allí podrás cambiar tu contraseña ingresando la actual y la nueva.",
    },
    {
      question: "¿Hay soporte técnico disponible?",
      answer:
        "Sí, nuestro equipo de soporte está disponible. Puedes crear un ticket de soporte usando el botón 'Nuevo Ticket' y te responderemos lo antes posible.",
    },
  ];

  const contactMethods = [
    {
      title: "Email de Soporte",
      description: "soporte@eiccc.com",
      icon: Mail,
      action: "Enviar email",
    },
    {
      title: "Chat en Vivo",
      description: "Disponible 24/7",
      icon: MessageCircle,
      action: "Iniciar chat",
    },
    {
      title: "Teléfono",
      description: "+56 2 2345 6789",
      icon: Phone,
      action: "Llamar",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Soporte</h1>
          <p className="text-muted-foreground">
            Encuentra ayuda y respuestas a tus preguntas
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ticket
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Métodos de contacto */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacto Directo</CardTitle>
              <CardDescription>Otras formas de contactarnos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <method.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{method.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {method.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos Útiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Guía de Usuario
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Tutoriales
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comunidad
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Mis Tickets */}
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusLabel(ticket.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(ticket.createdAt).toLocaleDateString(
                                "es-CL"
                              )}
                            </span>
                            <span>Prioridad: {getPriorityLabel(ticket.priority)}</span>
                          </div>
                        </div>
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
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <CardDescription>
                Encuentra respuestas rápidas a las preguntas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

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

export default StudentSupport;
