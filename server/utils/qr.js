const QRCode = require('qrcode');

/**
 * Generate a QR code as a data URL (base64 PNG)
 * @param {string} data - The data to encode
 * @returns {Promise<string>} - Data URL of the QR code image
 */
async function generateQRCode(data) {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('QR Code generation failed:', err);
    throw err;
  }
}

module.exports = { generateQRCode };
