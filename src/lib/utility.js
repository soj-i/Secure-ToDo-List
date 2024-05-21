const postmark = require("postmark");
require("dotenv").config();

// Attempt to send the email to the email provided
export const sendEmail = (destination, subject, htmlBody) => {
    const client = new postmark.ServerClient(process.env.POSTMARK_TOKEN);
    client.sendEmail({
        "From": process.env.POSTMARK_EMAIL,
        "To": destination,
        "Subject": subject,
        "HTMLBody": htmlBody
    });
};