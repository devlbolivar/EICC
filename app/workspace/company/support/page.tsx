"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  FileText,
  Search,
  Send,
  BookOpen,
  Users,
  Settings,
} from "lucide-react";

const CompanySupport = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("general");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Datos de ejemplo - en una implementación real vendrían de la API
  const supportCategories = [
    {
      id: "general",
      title: "General",
      icon: HelpCircle,
      description: "Preguntas generales sobre la plataforma",
      articles: 15,
    },
    {
      id: "billing",
      title: "Facturación",
      icon: FileText,
      description: "Problemas con pagos y facturas",
      articles: 8,
    },
    {
      id: "courses",
      title: "Cursos",
      icon: BookOpen,
      description: "Acceso y contenido de cursos",
      articles: 12,
    },
    {
      id: "employees",
      title: "Empleados",
      icon: Users,
      description: "Gestión de empleados y permisos",
      articles: 10,
    },
    {
      id: "technical",
      title: "Técnico",
      icon: Settings,
      description: "Problemas técnicos y configuración",
      articles: 6,
    },
  ];

  const faqItems = [
    {
      id: "1",
      question: "¿Cómo puedo agregar más empleados a mi empresa?",
      answer:
        "Puedes agregar empleados desde la sección 'Empleados' en tu dashboard. Haz clic en 'Invitar Empleado' y envía la invitación por email.",
      category: "employees",
      tags: ["empleados", "invitaciones"],
    },
    {
      id: "2",
      question: "¿Cuántos cursos están disponibles en mi plan?",
      answer:
        "Tu plan Premium incluye acceso a todos los cursos disponibles en la plataforma. No hay límite en el número de cursos que puedes asignar a tus empleados.",
      category: "courses",
      tags: ["cursos", "plan"],
    },
    {
      id: "3",
      question: "¿Cómo puedo cambiar mi método de pago?",
      answer:
        "Ve a la sección 'Facturación' y haz clic en 'Métodos de Pago'. Desde ahí puedes agregar, editar o eliminar métodos de pago.",
      category: "billing",
      tags: ["pagos", "facturación"],
    },
    {
      id: "4",
      question: "¿Los certificados tienen fecha de vencimiento?",
      answer:
        "Sí, los certificados tienen una validez de 1 año desde la fecha de emisión. Recibirás notificaciones cuando estén próximos a vencer.",
      category: "courses",
      tags: ["certificados", "validez"],
    },
  ];

  const tickets = [
    {
      id: "TICKET-001",
      subject: "Problema con acceso a cursos",
      status: "open",
      priority: "medium",
      createdAt: "2024-01-15",
      lastUpdate: "2024-01-15",
      category: "technical",
    },
    {
      id: "TICKET-002",
      subject: "Consulta sobre facturación",
      status: "resolved",
      priority: "low",
      createdAt: "2024-01-10",
      lastUpdate: "2024-01-12",
      category: "billing",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-yellow-100 text-yellow-800">Abierto</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resuelto</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Cerrado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Baja</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredFaq = faqItems.filter(
    (item) =>
      item.category === selectedCategory &&
      (searchQuery === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Soporte</h1>
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

      {/* Categorías de soporte */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías de Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportCategories.map((category) => (
              <div
                key={category.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <category.icon className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.articles} artículos
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preguntas Frecuentes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar en FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFaq.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.answer}
                </p>
                <div className="flex gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {filteredFaq.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron resultados</p>
                <p className="text-sm">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets de soporte */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mis Tickets de Soporte</CardTitle>
            <Button>Nuevo Ticket</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ticket #{ticket.id} •{" "}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}

            {tickets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tienes tickets de soporte</p>
                <p className="text-sm">
                  Crea un nuevo ticket si necesitas ayuda
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Contactar Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Asunto</label>
                <Input placeholder="Describe brevemente tu consulta" />
              </div>
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Selecciona una categoría</option>
                  <option value="general">General</option>
                  <option value="billing">Facturación</option>
                  <option value="courses">Cursos</option>
                  <option value="employees">Empleados</option>
                  <option value="technical">Técnico</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Prioridad</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <Textarea
                placeholder="Describe detalladamente tu problema o consulta..."
                rows={8}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Enviar Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
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
                Guías completas y tutoriales paso a paso
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
                Respuestas inmediatas de nuestro equipo
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Iniciar Chat
              </Button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Tiempo de Respuesta</h3>
              <p className="text-sm text-muted-foreground">
                Chat: Inmediato • Email: 24h • Teléfono: 9:00-18:00
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Ver Horarios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySupport;
