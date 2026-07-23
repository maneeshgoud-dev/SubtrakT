import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: "maneeshgoud.dev@gmail.com", pass: "fyurbnvbvmytybga" },
  tls: { rejectUnauthorized: false }
});
transporter.sendMail({
  from: '"SubTrackt" <maneeshgoud.dev@gmail.com>',
  to: "maneeshgoud.dev@gmail.com",
  subject: "SubTrackt - Email test",
  html: "<h2>Email system works!</h2><p>Your reminder emails are now working via Gmail.</p>"
}).then(() => { console.log("EMAIL SENT SUCCESSFULLY"); process.exit(0); })
  .catch(e => { console.log("FAILED:", e.message); process.exit(1); });
