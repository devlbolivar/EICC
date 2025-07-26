"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Send,
} from "lucide-react";

const StudentSupport = () => {
  const [contactForm, setContactForm] = React.useState({
    subject: "",
    message: "",
    priority: "",
  });

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
        "Sí, nuestro equipo de soporte está disponible 24/7. Puedes contactarnos a través de este formulario, por email o por teléfono.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el formulario
    console.log("Formulario enviado:", contactForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Soporte</h1>
        <p className="text-muted-foreground">
          Encuentra ayuda y respuestas a tus preguntas
        </p>
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

          {/* Formulario de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Contactar Soporte</CardTitle>
              <CardDescription>
                Envíanos un mensaje y te responderemos lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      placeholder="¿En qué podemos ayudarte?"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select
                      value={contactForm.priority}
                      onValueChange={(value) =>
                        setContactForm({ ...contactForm, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe tu problema o pregunta en detalle..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentSupport;
