const nodemailer = require("nodemailer");
const generateOTP=require("../services/generateOTP")

const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "akhiljagadish124@gmail.com", // Your Gmail email address
      pass: "brnn hwab frgs lnpn", // Your Gmail password
    },
  });

  const mailOptions = {
    from: "akhiljagadish124@gmail.com", // Your Gmail email address
    to: email,
    subject:subject,
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
