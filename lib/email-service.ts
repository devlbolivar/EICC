import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface InvitationEmailData {
  recipientEmail: string;
  companyName: string;
  invitationUrl: string;
  expiresAt: Date;
  customMessage?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Use environment variables for email configuration
    const emailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Only initialize if we have email credentials
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.warn("Email service not configured. Skipping email send.");
      return false;
    }

    try {
      const {
        recipientEmail,
        companyName,
        invitationUrl,
        expiresAt,
        customMessage,
      } = data;

      const subject = `Invitación para unirte a ${companyName}`;
      const html = this.generateInvitationHTML({
        companyName,
        invitationUrl,
        expiresAt,
        customMessage,
      });
      const text = this.generateInvitationText({
        companyName,
        invitationUrl,
        expiresAt,
        customMessage,
      });

      const mailOptions: EmailOptions = {
        to: recipientEmail,
        subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Invitation email sent successfully to ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error("Error sending invitation email:", error);
      return false;
    }
  }

  private generateInvitationHTML(data: {
    companyName: string;
    invitationUrl: string;
    expiresAt: Date;
    customMessage?: string;
  }): string {
    const { companyName, invitationUrl, expiresAt, customMessage } = data;
    const expiryDate = new Date(expiresAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación a ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Te han invitado a unirte a ${companyName}!</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Has sido invitado a unirte a la plataforma de aprendizaje de <strong>${companyName}</strong>.</p>
            
            ${customMessage ? `<p><em>"${customMessage}"</em></p>` : ""}
            
            <p>Para aceptar la invitación y crear tu cuenta, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">Aceptar Invitación</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Esta invitación expirará el ${expiryDate}. 
              Si no aceptas la invitación antes de esa fecha, tendrás que solicitar una nueva.
            </div>
            
            <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${invitationUrl}
            </p>
            
            <p>Una vez que aceptes la invitación, podrás:</p>
            <ul>
              <li>Acceder a todos los cursos disponibles para tu empresa</li>
              <li>Completar tu perfil personal</li>
              <li>Obtener certificados al completar cursos</li>
              <li>Ver tu progreso de aprendizaje</li>
            </ul>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
            <p>Si no esperabas esta invitación, puedes ignorar este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateInvitationText(data: {
    companyName: string;
    invitationUrl: string;
    expiresAt: Date;
    customMessage?: string;
  }): string {
    const { companyName, invitationUrl, expiresAt, customMessage } = data;
    const expiryDate = new Date(expiresAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
¡Te han invitado a unirte a ${companyName}!

Hola,

Has sido invitado a unirte a la plataforma de aprendizaje de ${companyName}.

${customMessage ? `Mensaje personalizado: "${customMessage}"` : ""}

Para aceptar la invitación y crear tu cuenta, visita este enlace:
${invitationUrl}

IMPORTANTE: Esta invitación expirará el ${expiryDate}.
Si no aceptas la invitación antes de esa fecha, tendrás que solicitar una nueva.

Una vez que aceptes la invitación, podrás:
- Acceder a todos los cursos disponibles para tu empresa
- Completar tu perfil personal
- Obtener certificados al completar cursos
- Ver tu progreso de aprendizaje

Este es un mensaje automático, por favor no respondas a este email.
Si no esperabas esta invitación, puedes ignorar este mensaje.
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();
