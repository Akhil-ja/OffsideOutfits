const nodemailer = require("nodemailer");
const generateOTP=require("../services/generateOTP")


const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL ,// Your Gmail email address
      pass: process.env.PASS , // Your Gmail password
    },
  });

  const mailOptions = {
    from: process.env.MAIL, // Your Gmail email address
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

module.exports = sendEmail;
