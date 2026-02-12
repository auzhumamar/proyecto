require('dotenv').config();

module.exports = {
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM,

    templates: {
        verification: {
            subject: 'Código de Verificación - CardioTrack',
            getHtml: (code, expirationMinutes) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🫀 CardioTrack</h1>
              <p>Sistema de Monitoreo Cardíaco</p>
            </div>
            <div class="content">
              <h2>Código de Verificación</h2>
              <p>Gracias por registrarte en CardioTrack. Usa el siguiente código para verificar tu cuenta:</p>
              <div class="code">${code}</div>
              <p class="warning">⚠️ Este código expira en ${expirationMinutes} minutos.</p>
              <p>Si no solicitaste este código, ignora este mensaje.</p>
            </div>
            <div class="footer">
              <p>© 2026 CardioTrack - Monitoreo Cardíaco Inteligente</p>
            </div>
          </div>
        </body>
        </html>
      `
        }
    }
};
