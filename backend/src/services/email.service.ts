import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Send new application notification to admin
  async sendNewApplicationNotification(
    applicationId: string,
    applicantName: string,
    companyName: string | null,
    industry: string
  ) {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn('ADMIN_EMAIL not configured, skipping email notification');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject: 'Новая заявка на внедрение ИИ-решения',
      html: `
        <h2>Получена новая заявка на внедрение ИИ-решения</h2>
        <p><strong>ID заявки:</strong> ${applicationId}</p>
        <p><strong>Заявитель:</strong> ${applicantName}</p>
        <p><strong>Компания:</strong> ${companyName || 'Не указана'}</p>
        <p><strong>Отрасль:</strong> ${industry}</p>
        <p><a href="${process.env.FRONTEND_URL}/admin/applications/${applicationId}">Просмотреть заявку</a></p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email notification sent for application ${applicationId}`);
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw error to not block application creation
    }
  }

  // Send application status update to user
  async sendApplicationStatusUpdate(
    userEmail: string,
    userName: string,
    applicationId: string,
    status: string
  ) {
    const statusMessages: Record<string, string> = {
      IN_REVIEW: 'на рассмотрении',
      ASSIGNED: 'назначен специалист',
      IN_PROGRESS: 'в работе',
      COMPLETED: 'завершена',
      REJECTED: 'отклонена',
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: 'Обновление статуса заявки',
      html: `
        <h2>Здравствуйте, ${userName}!</h2>
        <p>Статус вашей заявки на внедрение ИИ-решения изменился.</p>
        <p><strong>Новый статус:</strong> ${statusMessages[status] || status}</p>
        <p><a href="${process.env.FRONTEND_URL}/profile/applications/${applicationId}">Просмотреть детали заявки</a></p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  }

  // Send welcome email to new user
  async sendWelcomeEmail(userEmail: string, userName: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: 'Добро пожаловать в Open-AI.ru!',
      html: `
        <h2>Здравствуйте, ${userName}!</h2>
        <p>Добро пожаловать на платформу Open-AI.ru!</p>
        <p>Мы рады приветствовать вас в нашем сообществе.</p>
        <p>Вы можете начать с:</p>
        <ul>
          <li>Заполнения профиля</li>
          <li>Изучения каталога решений</li>
          <li>Подачи заявки на внедрение ИИ-решения</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL}/profile">Перейти в профиль</a></p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}

export default new EmailService();
