const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  try {
    // Configuración del transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Soporte App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    throw new Error("No se pudo enviar el correo");
  }
}

module.exports = sendEmail;