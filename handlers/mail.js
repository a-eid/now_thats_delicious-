const path = require("path");
const nodeMailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const promisify = require("es6-promisify");

const transport = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.send = async options => {
  const html = generateHTML(
    path.join(__dirname, "..", "views", "email", options.filename),
    options
  );
  const mailOptions = {
    from: `Ahmed Eid <noreply@github.com>`,
    to: options.user.email,
    html,
    text: htmlToText.fromString(html)
  };
  const sendMail = promisify(transport.sendMail, transport);
  await sendMail(mailOptions);
};

const generateHTML = (file, options = {}) => {
  const filePath = path.join(
    __dirname,
    "..",
    "views",
    "email",
    `${options.filename}.pug`
  );
  const html = pug.renderFile(filePath, options);
  return juice(html);
};
