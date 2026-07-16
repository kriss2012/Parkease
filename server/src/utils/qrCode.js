const crypto = require('crypto');
const QRCode = require('qrcode');

// Builds the signed payload embedded in a booking's QR code:
// { bookingId, expiry, hash } where hash = HMAC-SHA256(bookingId + expiry, secret)
const signPayload = (bookingId, expiresAt) => {
  const expiry = new Date(expiresAt).getTime();
  const hash = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(`${bookingId}:${expiry}`)
    .digest('hex');
  return { bookingId: String(bookingId), expiry, hash };
};

const verifyPayload = (payload) => {
  if (!payload || !payload.bookingId || !payload.expiry || !payload.hash) {
    return { valid: false, reason: 'MALFORMED_QR' };
  }
  const expected = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(`${payload.bookingId}:${payload.expiry}`)
    .digest('hex');

  if (expected !== payload.hash) {
    return { valid: false, reason: 'TAMPERED_QR' };
  }
  if (Date.now() > payload.expiry) {
    return { valid: false, reason: 'EXPIRED_QR' };
  }
  return { valid: true };
};

// Returns a base64 PNG data URL of the QR code encoding the signed payload
const generateQRDataURL = async (bookingId, expiresAt) => {
  const payload = signPayload(bookingId, expiresAt);
  const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), { errorCorrectionLevel: 'H', width: 300 });
  return { dataUrl, payload };
};

module.exports = { signPayload, verifyPayload, generateQRDataURL };
