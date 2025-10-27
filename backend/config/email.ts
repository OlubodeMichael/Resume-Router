import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string, from: string): Promise<boolean> {
    try {
        const mailOptions = {
            from,
            to,
            subject,
            html,
        };
        
        await resend.emails.send(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

export default sendEmail;