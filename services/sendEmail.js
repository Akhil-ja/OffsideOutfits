const nodemailer = require("nodemailer");



const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL ,
      pass: process.env.PASS , 
    },
  });

  const mailOptions = {
    from: process.env.MAIL, 
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
   
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

module.exports = sendEmail;
