/**
 * The mail endpoint, as a standalone service.
 *
 * On Vercel this was api/send-email.mjs, a function the platform wrapped: it
 * parsed the body, gave it a URL, and absorbed the abuse that arrives at any
 * public endpoint. Behind nginx none of that is free, so this file does the
 * parts that were being done for us:
 *
 *   - reads and size-limits the request body itself;
 *   - answers only same-origin POSTs, because an open endpoint that sends mail
 *     from the restaurant's own Gmail account is a relay for anyone who finds it;
 *   - rate limits per address, for the same reason;
 *   - escapes the submitted values before putting them in the HTML mail, which
 *     the original did not: a name containing markup ended up as live HTML in
 *     the inbox.
 *
 * It listens on the loopback only. nginx is what faces the internet.
 */
import { createServer } from 'node:http';
import nodemailer from 'nodemailer';

const PORT = Number(process.env.PORT || 3000);
const HOST = '127.0.0.1';
const TO = process.env.CONTACT_EMAIL || 'bookings@thesolo.co.uk';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://www.thesolo.co.uk,https://thesolo.co.uk')
  .split(',').map((s) => s.trim()).filter(Boolean);

const MAX_BODY = 32 * 1024;        // a reservation is a few hundred bytes
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;                // per address per window

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('SMTP_USER and SMTP_PASS are required. Refusing to start.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ---------------------------------------------------------------- rate limit
const hits = new Map();
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, times] of hits) {
    const kept = times.filter((t) => t > cutoff);
    if (kept.length) hits.set(ip, kept);
    else hits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

const overLimit = (ip) => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  const times = (hits.get(ip) || []).filter((t) => t > cutoff);
  times.push(Date.now());
  hits.set(ip, times);
  return times.length > RATE_MAX;
};

// ---------------------------------------------------------------- helpers
const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// A header value carrying a newline can add headers of its own, so the address
// that goes into Reply-To has to be an address and nothing else.
const safeEmail = (value) => {
  const v = String(value ?? '').trim();
  return /^[^\s@<>",;]{1,64}@[^\s@<>",;]{1,255}\.[a-z]{2,}$/i.test(v) ? v : '';
};

const readBody = (req) => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  req.on('error', reject);
});

const send = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload) });
  res.end(payload);
};

const shell = (title, sections) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #D4A574; border-bottom: 2px solid #D4A574; padding-bottom: 10px;">${title}</h2>
    ${sections}
    <div style="margin-top: 30px; padding: 20px; background: #001223; color: white; border-radius: 8px;">
      <p style="margin: 0;"><strong>🏛️ TheSolo Kitchen &amp; Bar</strong></p>
      <p style="margin: 5px 0 0 0;">📍 Museum Gardens, London, E2 9PA</p>
      <p style="margin: 5px 0 0 0;">📞 Phone: 020 8014 2656</p>
    </div>
  </div>`;

const panel = (heading, rows) => `
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #001223; margin-top: 0;">${heading}</h3>
      ${rows}
    </div>`;

const row = (label, value) => `<p><strong>${label}:</strong> ${esc(value)}</p>`;

// ---------------------------------------------------------------- server
const server = createServer(async (req, res) => {
  if (req.url !== '/api/send-email' && req.url !== '/send-email') return send(res, 404, { error: 'Not found' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  // Only the site's own pages may use this endpoint.
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return send(res, 403, { success: false, error: 'Forbidden' });

  const ip = (req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown').toString();
  if (overLimit(ip)) return send(res, 429, { success: false, error: 'Too many requests. Please try again later.' });

  let form;
  try {
    form = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { success: false, error: 'Invalid request' });
  }

  const replyTo = safeEmail(form.email);
  const isReservation = form.type === 'reservation';

  if (isReservation) {
    if (!form.name || !replyTo || !form.mobile || !form.date || !form.time) {
      return send(res, 400, { success: false, error: 'Missing required reservation fields' });
    }
  } else if (!form.name || !replyTo || !form.message) {
    return send(res, 400, { success: false, error: 'Missing required contact fields' });
  }

  const subject = isReservation
    ? `🍽️ Reservation Request - ${String(form.name).slice(0, 80)}`
    : `💬 Contact Form - ${String(form.name).slice(0, 80)} (${String(form.subject ?? '').slice(0, 80)})`;

  const html = isReservation
    ? shell('🍽️ New Reservation Request',
        panel('👤 Customer Details:', row('Name', form.name) + row('Email', replyTo) + row('Mobile', form.mobile || 'Not provided')) +
        panel('📅 Reservation Details:',
          row('Date', form.date) + row('Time', form.time) + row('Number of People', form.people) +
          row('Event Booking', form.isEvent === 'yes' ? 'Yes ✅' : 'No ❌') +
          (form.eventArea ? row('Event Area', form.eventArea) : '')))
    : shell('💬 New Contact Form Submission',
        panel('👤 Contact Details:', row('Name', form.name) + row('Email', replyTo) + row('Phone', form.phone || 'Not provided') + row('Subject', form.subject)) +
        panel('💬 Message:', `<p style="white-space: pre-wrap;">${esc(form.message)}</p>`));

  try {
    await transporter.sendMail({
      from: `"TheSolo Website" <${process.env.SMTP_USER}>`,
      to: TO,
      subject,
      html,
      replyTo,
    });
    // The submission itself is a customer's personal data, so it is not logged.
    console.log(`sent: ${isReservation ? 'reservation' : 'contact'}`);
    return send(res, 200, { success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('send failed:', error.message);
    return send(res, 500, { success: false, error: 'Failed to send email' });
  }
});

server.listen(PORT, HOST, () => console.log(`thesolo-api listening on ${HOST}:${PORT}, mail to ${TO}`));

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
