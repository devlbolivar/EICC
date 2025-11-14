# Email Configuration for Invitation System

To enable email sending for invitations, you need to configure SMTP settings in your environment variables.

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Provider Examples

### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Note for Gmail**: You need to:

1. Enable 2-factor authentication
2. Generate an "App Password" for this application
3. Use the App Password as SMTP_PASS

### Outlook/Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

## Testing

1. Configure your email settings in `.env.local`
2. Restart your development server
3. Try sending an invitation
4. Check the console logs for email sending status

## Fallback Behavior

If email configuration is not provided or fails:

- Invitations are still created in the database
- Users can manually copy and share the invitation link
- The system will log a warning about missing email configuration
