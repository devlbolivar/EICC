import { emailService } from "../lib/email-service.ts";

async function testEmail() {
  console.log("Testing email service...");

  const testData = {
    recipientEmail: "test@example.com",
    companyName: "Test Company",
    invitationUrl: "https://example.com/accept-invite?token=test123",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    customMessage: "This is a test invitation",
  };

  try {
    const result = await emailService.sendInvitationEmail(testData);
    console.log("Email test result:", result);

    if (result) {
      console.log("✅ Email service is working correctly");
    } else {
      console.log("⚠️ Email service is not configured or failed to send");
    }
  } catch (error) {
    console.error("❌ Email test failed:", error);
  }
}

testEmail();
