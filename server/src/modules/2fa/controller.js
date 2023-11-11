const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

async function generateQr(req, res) {
  try {
    const QR_NAME = 'poppy';
    // currently image not work
    const AVATAR = "https://res.cloudinary.com/tutotring/image/upload/v1699610578/Icon-App-29x29_3x_oxw7le.png";

    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(QR_NAME)}?secret=${secret.base32}&issuer=${encodeURIComponent(QR_NAME)}&image=${encodeURIComponent(AVATAR)}`;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    res.send(`
    <div>
      <h2>Scan the QR Code with a TOTP App</h2>
      <img src="${qrCodeUrl}" alt="QR Code">
    </div>
  `);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error, try again!' });
  }
}

module.exports = {
  generateQr
}