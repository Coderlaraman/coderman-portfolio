import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const { name, email, subject, message } = data;

  // Verify connection configuration
  try {
    await transporter.verify();
  } catch (error) {
    console.error('Error verifying email transporter:', error);
    throw new Error('Email service configuration error');
  }

  // Send mail with defined transport object
  try {
    const info = await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`, // sender address (must be authenticated user)
      replyTo: email, // user's email for reply
      to: process.env.EMAIL_USER, // list of receivers (you)
      subject: `Portfolio Contact: ${subject || `New message from ${name}`}`, // Subject line
      text: `
You have received a new message from your portfolio contact form.

Name: ${name}
Email: ${email}
Subject: ${subject || 'No subject'}

Message:
${message}
      `, // plain text body
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Portfolio Contact Message</h2>
  <p>You have received a new message from your portfolio contact form.</p>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
  </div>

  <h3 style="color: #555;">Message:</h3>
  <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
    ${message.replace(/\n/g, '<br>')}
  </div>
</div>
      `, // html body
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
