import nodemailer from "nodemailer";


export interface IEmailService {
  sendActivateEmail(to: string, link: string): Promise<void>;
}

class EmailService implements IEmailService {
  transporter: nodemailer.Transporter;
 
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: useRuntimeConfig().smtpHost,
      port: useRuntimeConfig().smtpPort,
      secure: true,
      auth: {
        user: useRuntimeConfig().smtpUser,
        pass: useRuntimeConfig().smtpPass,
      },
    });
  }

  async sendActivateEmail(to: string, link: string) {
    await this.transporter.sendMail({
      from: useRuntimeConfig().smtpUser,
      to,
      subject: "Account Activation on the Site (Site Name)",
      text: "Text message",
      html: `
        <div>
          <h1>Please click the link below to activate your account</h1>
          <a href=${link}>${link}</a>
        </div>
      `,
      headers: {
        "Content-Language": "en-US"
      }
    });
  }

}

export default EmailService;
