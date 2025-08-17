// Vercel Serverless Function
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Debug logging
    console.log('Received form data:', JSON.stringify(formData, null, 2));
    console.log('Request method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Validate required fields based on form type
    if (formData.type === 'reservation') {
      if (!formData.name || !formData.email || !formData.mobile || !formData.date || !formData.time) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required reservation fields' 
        });
      }
    } else {
      if (!formData.name || !formData.email || !formData.message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required contact fields' 
        });
      }
    }

    // Check environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP credentials:', {
        SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT_SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT_SET'
      });
      return res.status(500).json({ 
        success: false, 
        error: 'SMTP credentials not configured' 
      });
    }

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    // Create SMTP transporter
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Determine email content based on form type
    let subject;
    let htmlContent;

    if (formData.type === 'reservation') {
      // Reservation form
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
            <p><strong>Mobile:</strong> ${formData.mobile || 'Not provided'}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #001223; margin-top: 0;">📅 Reservation Details:</h3>
            <p><strong>Date:</strong> ${formData.date}</p>
            <p><strong>Time:</strong> ${formData.time}</p>
            <p><strong>Number of People:</strong> ${formData.people}</p>
            <p><strong>Event Booking:</strong> ${formData.isEvent === 'yes' ? 'Yes ✅' : 'No ❌'}</p>
            ${formData.eventArea ? `<p><strong>Event Area:</strong> ${formData.eventArea}</p>` : ''}
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
      // Contact form
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
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
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

    // Email options
    const mailOptions = {
      from: `"TheSolo Website" <${process.env.SMTP_USER}>`,
      to: 'bookings@thesolo.co.uk',
      subject: subject,
      html: htmlContent,
      replyTo: formData.email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      env: {
        SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT_SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT_SET'
      }
    });
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send email: ' + error.message 
    });
  }
}
