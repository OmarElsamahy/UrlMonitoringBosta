const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
        user: process.env.USERMAIL,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USERMAIL,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};
