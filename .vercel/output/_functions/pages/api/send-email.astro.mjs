import nodemailer from 'nodemailer';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const formData = await request.json();
    if (!formData.name || !formData.email || !formData.message) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    let subject;
    let htmlContent;
    if (formData.type === "reservation") {
      subject = `🍽️ Reservation Request - ${formData.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4A574; border-bottom: 2px solid #D4A574; padding-bottom: 10px;">
            🍽️ New Reservation Request
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #001223; margin-top: 0;">👤 Customer Details:</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Mobile:</strong> ${formData.mobile || "Not provided"}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #001223; margin-top: 0;">📅 Reservation Details:</h3>
            <p><strong>Date:</strong> ${formData.date}</p>
            <p><strong>Time:</strong> ${formData.time}</p>
            <p><strong>Number of People:</strong> ${formData.people}</p>
            <p><strong>Event Booking:</strong> ${formData.isEvent === "yes" ? "Yes ✅" : "No ❌"}</p>
            ${formData.eventArea ? `<p><strong>Event Area:</strong> ${formData.eventArea}</p>` : ""}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #001223; color: white; border-radius: 8px;">
            <p style="margin: 0;"><strong>🏛️ TheSolo Kitchen & Bar</strong></p>
            <p style="margin: 5px 0 0 0;">📍 Museum Gardens, London, E2 9PA</p>
            <p style="margin: 5px 0 0 0;">📞 Phone: 020 3340 8082</p>
            <p style="margin: 5px 0 0 0;">📧 Reply to: ${formData.email}</p>
          </div>
        </div>
      `;
    } else {
      subject = `💬 Contact Form - ${formData.name} (${formData.subject})`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4A574; border-bottom: 2px solid #D4A574; padding-bottom: 10px;">
            💬 New Contact Form Submission
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #001223; margin-top: 0;">👤 Contact Details:</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #001223; margin-top: 0;">💬 Message:</h3>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #001223; color: white; border-radius: 8px;">
            <p style="margin: 0;"><strong>🏛️ TheSolo Kitchen & Bar</strong></p>
            <p style="margin: 5px 0 0 0;">📍 Museum Gardens, London, E2 9PA</p>
            <p style="margin: 5px 0 0 0;">📞 Phone: 020 3340 8082</p>
            <p style="margin: 5px 0 0 0;">📧 Reply to: ${formData.email}</p>
          </div>
        </div>
      `;
    }
    const mailOptions = {
      from: `"TheSolo Website" <${process.env.SMTP_USER}>`,
      to: "bookings@thesolo.co.uk",
      subject,
      html: htmlContent,
      replyTo: formData.email
    };
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({
      success: true,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to send email"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
