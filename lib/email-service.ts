import nodemailer from "nodemailer";
import { APP_CONFIG, EMAIL_COLORS, EMAIL_STYLES } from "@/lib/config";

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
      return true;
    } catch {
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
          body { font-family: ${EMAIL_STYLES.FONT_FAMILY}; line-height: ${EMAIL_STYLES.LINE_HEIGHT}; color: ${EMAIL_COLORS.TEXT_DEFAULT}; }
          .container { max-width: ${EMAIL_STYLES.MAX_WIDTH}; margin: 0 auto; padding: ${EMAIL_STYLES.PADDING_LARGE}; }
          .header { background: ${EMAIL_COLORS.PRIMARY}; color: ${EMAIL_COLORS.PRIMARY_TEXT}; padding: ${EMAIL_STYLES.PADDING_LARGE}; text-align: center; border-radius: ${EMAIL_STYLES.BORDER_RADIUS_LARGE} ${EMAIL_STYLES.BORDER_RADIUS_LARGE} 0 0; }
          .content { background: ${EMAIL_COLORS.BACKGROUND}; padding: ${EMAIL_STYLES.PADDING_XL}; border-radius: 0 0 ${EMAIL_STYLES.BORDER_RADIUS_LARGE} ${EMAIL_STYLES.BORDER_RADIUS_LARGE}; }
          .button { display: inline-block; background: ${EMAIL_COLORS.PRIMARY}; color: ${EMAIL_COLORS.PRIMARY_TEXT}; padding: 12px 24px; text-decoration: none; border-radius: ${EMAIL_STYLES.BORDER_RADIUS}; margin: 20px 0; }
          .footer { text-align: center; margin-top: ${EMAIL_STYLES.PADDING_XL}; color: ${EMAIL_COLORS.TEXT_MUTED}; font-size: ${EMAIL_STYLES.FONT_SIZE_SMALL}; }
          .warning { background: ${EMAIL_COLORS.WARNING_BG}; border: 1px solid ${EMAIL_COLORS.WARNING_BORDER}; padding: ${EMAIL_STYLES.PADDING_MEDIUM}; border-radius: ${EMAIL_STYLES.BORDER_RADIUS}; margin: 20px 0; }
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
            <p style="word-break: break-all; background: ${EMAIL_COLORS.CODE_BG}; padding: ${EMAIL_STYLES.PADDING_SMALL}; border-radius: 4px; font-family: monospace;">
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

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<boolean> {
    if (!this.transporter) {
      console.warn("Email service not configured. Skipping password reset email.");
      return false;
    }

    try {
      const resetUrl = `${APP_CONFIG.BASE_URL}/reset-password?token=${resetToken}`;
      const subject = "Restablecer tu contraseña";
      const html = this.generatePasswordResetHTML(userName, resetUrl);
      const text = this.generatePasswordResetText(userName, resetUrl);

      const mailOptions: EmailOptions = {
        to: email,
        subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch {
      return false;
    }
  }

  private generatePasswordResetHTML(userName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
        <style>
          body { font-family: ${EMAIL_STYLES.FONT_FAMILY}; line-height: ${EMAIL_STYLES.LINE_HEIGHT}; color: ${EMAIL_COLORS.TEXT_DEFAULT}; }
          .container { max-width: ${EMAIL_STYLES.MAX_WIDTH}; margin: 0 auto; padding: ${EMAIL_STYLES.PADDING_LARGE}; }
          .header { background: ${EMAIL_COLORS.PRIMARY}; color: ${EMAIL_COLORS.PRIMARY_TEXT}; padding: ${EMAIL_STYLES.PADDING_LARGE}; text-align: center; border-radius: ${EMAIL_STYLES.BORDER_RADIUS_LARGE} ${EMAIL_STYLES.BORDER_RADIUS_LARGE} 0 0; }
          .content { background: ${EMAIL_COLORS.BACKGROUND}; padding: ${EMAIL_STYLES.PADDING_XL}; border-radius: 0 0 ${EMAIL_STYLES.BORDER_RADIUS_LARGE} ${EMAIL_STYLES.BORDER_RADIUS_LARGE}; }
          .button { display: inline-block; background: ${EMAIL_COLORS.PRIMARY}; color: ${EMAIL_COLORS.PRIMARY_TEXT}; padding: 12px 24px; text-decoration: none; border-radius: ${EMAIL_STYLES.BORDER_RADIUS}; margin: 20px 0; }
          .footer { text-align: center; margin-top: ${EMAIL_STYLES.PADDING_XL}; color: ${EMAIL_COLORS.TEXT_MUTED}; font-size: ${EMAIL_STYLES.FONT_SIZE_SMALL}; }
          .warning { background: ${EMAIL_COLORS.WARNING_BG}; border: 1px solid ${EMAIL_COLORS.WARNING_BORDER}; padding: ${EMAIL_STYLES.PADDING_MEDIUM}; border-radius: ${EMAIL_STYLES.BORDER_RADIUS}; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer tu Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola ${userName},</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>

            <div class="warning">
              <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora.
            </div>

            <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: ${EMAIL_COLORS.CODE_BG}; padding: ${EMAIL_STYLES.PADDING_SMALL}; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>

            <p><strong>¿No solicitaste restablecer tu contraseña?</strong></p>
            <p>Si no realizaste esta solicitud, puedes ignorar este mensaje de forma segura. Tu contraseña no será cambiada.</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetText(userName: string, resetUrl: string): string {
    return `
Restablecer tu Contraseña

Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita este enlace:
${resetUrl}

IMPORTANTE: Este enlace expirará en 1 hora.

¿No solicitaste restablecer tu contraseña?
Si no realizaste esta solicitud, puedes ignorar este mensaje de forma segura. Tu contraseña no será cambiada.

Este es un mensaje automático, por favor no respondas a este email.
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export convenience function
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> {
  return emailService.sendPasswordResetEmail(email, resetToken, userName);
}
