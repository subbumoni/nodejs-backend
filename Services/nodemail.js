//importing nodemailer to send mail
import nodemailer from "nodemailer";
//Importing dotenv to access environmental variables
import dotenv from "dotenv";

//configuring .env file
dotenv.config();

//mail send method
export const mail = async (userEmail, sub, body) => {
  try {
    //creating transport
    let mailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MY_APP_EMAIL,
        pass: process.env.MY_EMAIL_APP_PASSWORD,
      },
    });

    //setting up all details
    let details = {
      from: `"Vijay" <${process.env.MY_APP_EMAIL}>`,
      to: userEmail,
      subject: `${sub}`,
      html: `<p>Your account reset password link : <a href='${body}' target="_blank">${body}</a></p>
                <p>It will expire within 15 minutes</p>
                <p><i>Please don't reply to this email</i></p>
                <p>Thank you!</p>`,
    };
    //sending mail
    await mailTransporter.sendMail(details);
    // console.log(`Mail Sent Successfully!`);
    return true;
  } catch (error) {
    //sending error, if any error happened
    console.log(`Mail Not Sent: ${error.message}`);
    return false;
  }
};
