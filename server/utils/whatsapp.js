/**
 * Send WhatsApp confirmation message via Twilio
 * Gracefully skips if Twilio credentials are not configured
 */
async function sendWhatsAppConfirmation({ to, participantId, participantName }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.log('ℹ️  Twilio not configured. Skipping WhatsApp message.');
    return { sent: false, reason: 'Twilio not configured' };
  }

  try {
    const twilio = require('twilio')(accountSid, authToken);

    const message = await twilio.messages.create({
      from: from,
      to: `whatsapp:${to}`,
      body: `🎉 *Registration Confirmed!*\n\nHi ${participantName},\n\nYour registration was successful!\n\n📋 *Participant ID:* ${participantId}\n📅 *Event:* EventX\n📍 *Venue:* TBA\n\nPlease show your QR code at the entrance for check-in.\n\nSee you there! 🚀`,
    });

    console.log(`✅ WhatsApp message sent: ${message.sid}`);
    return { sent: true, messageSid: message.sid };
  } catch (err) {
    console.error('❌ WhatsApp send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendWhatsAppConfirmation };
