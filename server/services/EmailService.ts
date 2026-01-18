
import nodemailer from "nodemailer";


export interface IEmailService {
  sendActivateEmail(to: string, link: string): Promise<void>;
}


class EmailService implements IEmailService {
  
  private transporter: nodemailer.Transporter | null = null;
  private getTransporter() {
    if (this.transporter) return this.transporter;

    const config = useRuntimeConfig();

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    return this.transporter;
  }

  async sendActivateEmail(to: string, link: string) {

    const config = useRuntimeConfig(); // Вызываем один раз для данных письма
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: config.smtpUser,
      to,
      subject: "Account Activation on the Site (Site Name)",
      text: "Text message",
      html: `
      <div style="font-family: sans-serif;">
        <h1>Please click the link below to activate your account</h1>
        <a href="${link}" style="color: #007bff; text-decoration: none;">Activate Account</a>
      </div>
    `,
      headers: {
        "Content-Language": "en-US"
      }
    });
  }

}


export default EmailService;
